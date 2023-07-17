import { setupWebSocketServer } from "./websocket";
import http from "http";

require("dotenv").config();
import mongoose from "mongoose";
import app from "./app";

const server = http.createServer();
setupWebSocketServer(server);

// DB Connection
const db = "mongodb://localhost:27017/advanceddashboard";
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected..."))
  .catch((err: any) => console.log(err));

const port = process.env.REST_PORT || 3000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

server.listen(process.env.WS_PORT || 3001, () => {
  console.log(`Listening: http://localhost:${process.env.WS_PORT || 3001}`);
});
