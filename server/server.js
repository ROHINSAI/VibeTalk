import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import "dotenv/config";
import { connectDB, disconnectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRouter.js";
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId, "Socket ID:", socket.id);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    const onlineUserIds = Object.keys(userSocketMap);
    console.log("Online users:", onlineUserIds);
    io.emit("getOnlineUsers", onlineUserIds);
  }

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);
    delete userSocketMap[userId];
    const onlineUserIds = Object.keys(userSocketMap);
    console.log("Online users after disconnect:", onlineUserIds);
    io.emit("getOnlineUsers", onlineUserIds);
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
