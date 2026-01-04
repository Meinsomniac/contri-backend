import { createServer } from "node:http";
import app from "./app";
import { Server } from "socket.io";
import { config } from "dotenv";

config();

// Create HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    credentials: true,
  },
});

// Server configuration
const PORT = process.env.PORT || 3000;

//Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📡 Health check: http://localhost:${PORT}/health
    📝 Environment: ${process.env.NODE_ENV || "development"}
  `);
});

// Export for testing
export { httpServer, io };
