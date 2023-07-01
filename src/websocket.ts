import WebSocket from 'ws';
import url from 'url';
import jwt from 'jsonwebtoken';

interface CustomWebSocket extends WebSocket {
  user?: any;
}

export const setupWebSocketServer = (server: any) => {
  let counter = 0;
  const wss = new WebSocket.Server({ server });

  // Increment the counter and send the new value to each connected client every second
  setInterval(() => {
    counter++;
    wss.clients.forEach((client: CustomWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(counter.toString());
      }
    });
  }, 2000);

  wss.on('connection', function connection(ws: CustomWebSocket, req) {
    const parameters = url.parse(req.url!, true).query;
    const token = parameters.token as string;

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string);
      ws.user = payload;
    } catch (err) {
      ws.terminate();
    }

    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });

    ws.send('something');
  });
};
