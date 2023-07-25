import WebSocket from "ws";
import url from "url";
import jwt from "jsonwebtoken";
import mqtt from "mqtt";
import Register from "./models/Register";
import { v4 as uuidv4 } from "uuid";

interface CustomWebSocket extends WebSocket {
  user?: any;
  connectionId?: string;
  subscriptions?: Set<string>; // Using a Set to avoid duplicate register IDs.
}

export const setupWebSocketServer = (server: any) => {
  const userSockets = new Map();
  const wss = new WebSocket.Server({ server });

  const subscriptions = new Map(); // connectionId: Set<registerId's>

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

      ws.connectionId = uuidv4();
      if (!userSockets.has(ws.user.id)) {
        userSockets.set(ws.user.id, []);
      }
      userSockets.get(ws.user.id).push(ws);
    } catch (err) {
      ws.terminate();
      return;
    }

    ws.on("close", function close() {
      if (userSockets.get(ws.connectionId) === ws) {
        userSockets.delete(ws.connectionId);
      }
      if (subscriptions.get(ws.connectionId)) {
        subscriptions.delete(ws.connectionId);
      }
    });

    ws.subscriptions = new Set(); // Initialize subscriptions for this connection
    subscriptions.set(ws.connectionId, ws.subscriptions);

    ws.on("message", function incoming(message) {
      try {
        const dataObject = JSON.parse(message.toString());

        if (dataObject.type === "subscribe") {
          dataObject.registerIds.forEach((registerId: string) => {
            const mqttTopic = `${ws.user.organizationId}/${registerId}`;
            mqttClient.subscribe(mqttTopic);

            ws.subscriptions?.add(registerId);
          });
        } else if (dataObject.type === "change") {
          Register.updateOne(
            { _id: dataObject.register._id },
            { value: dataObject.register.value }
          ).exec();
          const mqttTopic = `${ws.user.organizationId}/${dataObject.register._id}`;
          mqttClient.publish(mqttTopic, dataObject.register.value);
        } else {
          console.log("Unknown message type");
        }
      } catch (err) {
        console.log(err);
      }
    });

    // Connect to MQTT server
    const mqttClient = mqtt.connect("mqtt://localhost:1883");

    mqttClient.on("connect", () => {
      console.log("connected to MQTT server");
    });

    mqttClient.on("message", (topic, message) => {
      const [organizationId, registerId] = topic.split("/");

      subscriptions.forEach((registeredIds, connectionId) => {
        if (registeredIds.has(registerId)) {
          // Get the user connection array using the user id
          const userWsArray = userSockets.get(ws.user.id);
          // Iterate over the user's connections and send the MQTT message to each one
          userWsArray?.forEach((ws: CustomWebSocket) => {
            if (
              ws &&
              ws.user.organizationId === organizationId &&
              ws.connectionId === connectionId
            ) {
              const payload = {
                registerId: registerId,
                value: message.toString(),
              };
              Register.updateOne(
                { _id: registerId },
                { value: message.toString() }
              ).exec();
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
              }
            }
          });
        }
      });
    });
  });
};
