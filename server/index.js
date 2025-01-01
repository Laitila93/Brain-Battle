import { createServer } from "http";
import { Server } from "socket.io";
import { Data } from "./Data.js";
import { sockets } from "./sockets.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://brainbattle-b2p0.onrender.com", // Replace with your frontend's Render URL
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

const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
