import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import "dotenv/config";
import { connectDB, disconnectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRouter.js";
import friendRouter from "./routes/friendRouter.js";
import groupRouter from "./routes/groupRouter.js";
import geminiRouter from "./routes/geminiRouter.js";
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://vibe-talk-six.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.some((allowed) => origin?.includes(allowed))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "VibeTalk API Server",
    status: "running",
    endpoints: {
      status: "/status",
      users: "/users",
      messages: "/messages",
    },
  });
});

app.use("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/users/test", (req, res) => {
  res.json({ message: "Users endpoint is working!", timestamp: Date.now() });
});

app.get("/api/messages/test", (req, res) => {
  res.json({ message: "Messages endpoint is working!", timestamp: Date.now() });
});

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/friends", friendRouter);
app.use("/api/groups", groupRouter);
app.use("/api/gemini", geminiRouter);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

export const userSocketMap = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId, "Socket ID:", socket.id);

  if (userId && userId !== "undefined") {
    userSocketMap.set(userId, socket.id);
    const onlineUserIds = [...userSocketMap.keys()];
    io.emit("getOnlineUsers", onlineUserIds);
  }

  socket.on("disconnect", () => {
    userSocketMap.delete(userId);
    const onlineUserIds = [...userSocketMap.keys()];
    io.emit("getOnlineUsers", onlineUserIds);

    // update user's lastSeen timestamp
    try {
      if (userId) {
        import("./models/User.js").then(({ default: User }) => {
          User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch((e) =>
            console.warn("failed to update lastSeen:", e.message || e)
          );
        });
      }
    } catch (err) {
      console.warn("Error scheduling lastSeen update:", err.message || err);
    }
  });

  // WebRTC signaling events for voice/video calls
  socket.on("callRequest", ({ to, from, offer, callType }) => {
    const recipientSocketId = userSocketMap.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("incomingCall", {
        from,
        offer,
        callType,
      });
    }
  });

  socket.on("callAccepted", ({ to, answer }) => {
    const callerSocketId = userSocketMap.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { answer });
    }
  });

  socket.on("callRejected", ({ to }) => {
    const callerSocketId = userSocketMap.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const recipientSocketId = userSocketMap.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("iceCandidate", { candidate });
    }
  });

  socket.on("endCall", ({ to }) => {
    const recipientSocketId = userSocketMap.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("callEnded");
    }
  });
});

const PORT = process.env.PORT || 8000;

// Make io and userSocketMap available to controllers
app.set("io", io);
app.set("userSocketMap", userSocketMap);

let dbConnected = false;
const initDB = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("Database connected");
    } catch (err) {
      console.error("Database connection failed:", err);
    }
  }
};

initDB();

if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
