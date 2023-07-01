import dotenv from 'dotenv';
dotenv.config();
import { setupWebSocketServer } from './websocket';
import http from 'http';

import mongoose from 'mongoose';
import app from './app';

const server = http.createServer(app);
setupWebSocketServer(server);

// DB Connection
const db = 'mongodb://127.0.0.1:27017/advanceddashboard';
mongoose.connect(db)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const port = process.env.REST_PORT || 3000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

server.listen(process.env.WS_PORT || 3001, () => {
  console.log(`Listening: http://localhost:${process.env.WS_PORT || 3001}`);
});
