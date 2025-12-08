import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import "dotenv/config";
import { connectDB, disconnectDB } from "./lib/db.js";
const app = express();
const server = http.createServer(app);
app.use(express.json({ limit: "4mb" }));
app.use(cors());
app.use("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });

  socket.on("chat message", (msg) => {
    console.log("message received:", msg);
    io.emit("chat message", msg);
  });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

// Graceful shutdown: close http server, socket.io and disconnect DB
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal} - shutting down gracefully`);
  // stop accepting new connections
  server.close(async (err) => {
    if (err) {
      console.error("Error closing server:", err);
      process.exit(1);
    }
    try {
      await disconnectDB();
    } catch (e) {
      console.error("Error disconnecting DB:", e);
    }
    console.log("Shutdown complete");
    process.exit(0);
  });

  // Close socket.io immediately
  try {
    io.close();
  } catch (e) {
    // ignore
  }

  // Force shutdown if not exited in time
  setTimeout(() => {
    console.error("Forcing shutdown");
    process.exit(1);
  }, 10_000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
