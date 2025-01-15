import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let httpServer;
let io;

if (process.env.NODE_ENV === 'production') {
  const app = express();
  httpServer = createServer(app);
  io = new Server(httpServer);

  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  httpServer = createServer();
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET"],
      credentials: true
    }
  });
}

import { Data } from "./Data.js";
import { sockets } from "./sockets.js";

let data = new Data();

io.on('connection', function (socket) {
  sockets(this, socket, data);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, function() {
  console.log("Socket.io server running on http://localhost:" + PORT);
});