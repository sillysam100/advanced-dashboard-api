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
      userSockets.set(ws.user.id, ws);
    } catch (err) {
      ws.terminate();
    }

    ws.on("close", function close() {
      userSockets.delete(ws.user.id);
    });

    ws.on("message", function incoming(message) {
      console.log("received: %s", message);
    });
  });

  // Connect to MQTT server
  const mqttClient = mqtt.connect("mqtt://localhost"); // replace with your mqtt server url

  mqttClient.on("connect", () => {
    console.log("connected to MQTT server");
    mqttClient.subscribe("#"); // subscribes to all topics. You might want to restrict this to specific topics
  });

  mqttClient.on("message", (topic, message) => {
    const [userId, registerId] = topic.split("/");
    const ws = userSockets.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = {
        registerId: registerId,
        value: message.toString(),
      };
      Register.updateOne(
        { _id: registerId },
        { value: message.toString() }
      ).exec();
      ws.send(JSON.stringify(payload));
    }
  });
};
