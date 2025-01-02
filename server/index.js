import { createServer } from "http";
import { Server } from "socket.io";
import { Data } from "./Data.js";
import { sockets } from "./sockets.js";
import dotenv from "dotenv";

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Replace with your frontend's Render URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});
let data = new Data();

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
  sockets(this, socket, data);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
});
