import WebSocket from "ws";
import url from "url";
import jwt from "jsonwebtoken";
import mqtt from "mqtt"; // you need to install mqtt library
import Register from "./models/Register";

interface CustomWebSocket extends WebSocket {
  user?: any;
}

export const setupWebSocketServer = (server: any) => {
  const userSockets = new Map();
  const wss = new WebSocket.Server({ server });

  wss.on("connection", function connection(ws: CustomWebSocket, req) {
    const parameters = url.parse(req.url!, true).query;
    const token = parameters.token as string;

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string);
      ws.user = payload;

      if (!ws.user?.id) {
        ws.terminate();
        return;
      }

      if (!userSockets.has(ws.user.id)) {
        userSockets.set(ws.user.id, []);
      }
      userSockets.get(ws.user.id).push(ws);
    } catch (err) {
      ws.terminate();
      return;
    }

    ws.on("close", function close() {
      const userConnections = userSockets.get(ws.user.id);
      if (userConnections) {
        const index = userConnections.indexOf(ws);
        if (index !== -1) {
          userConnections.splice(index, 1);
        }
        if (userConnections.length === 0) {
          userSockets.delete(ws.user.id);
        }
      }
    });

    ws.on("message", function incoming(message) {
      try {
        const data = message.toString();
        const dataObject = JSON.parse(data);
        const mqttTopic = `${ws.user.id}/${dataObject._id}`;
        mqttClient.publish(mqttTopic, dataObject.value);
      } catch (err) {
        console.log(err);
      }
    });
  });

  // Connect to MQTT server
  const mqttClient = mqtt.connect("mqtt://advanceddashboard.duckdns.org", {
    username: "advanceddashboard",
    password: "X1ZjUKe6iE!L",
  });

  mqttClient.on("connect", () => {
    console.log("connected to MQTT server");
    mqttClient.subscribe("#");
  });

  mqttClient.on("message", (topic, message) => {
    const [userId, registerId] = topic.split("/");
    const userConnections = userSockets.get(userId);
    if (userConnections) {
      const payload = {
        registerId: registerId,
        value: message.toString(),
      };
      Register.updateOne(
        { _id: registerId },
        { value: message.toString() }
      ).exec();
      userConnections.forEach((ws: CustomWebSocket) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      });
    }
  });
};
