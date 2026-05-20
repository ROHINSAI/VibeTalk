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
import { redis } from "./lib/redis.js";
import cron from "node-cron";
import { buildAllIndexes } from "./scripts/buildIndexes.js";
import { connectAMQP, getAMQPChannel } from "./lib/amqp.js";
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://vibe-talk-six.vercel.app",
  "https://vibetalk-r1.onrender.com",
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
      status: "/api/status",
      users: "/api/users",
      messages: "/api/messages",
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

app.get("/api/redis/test", async (req, res) => {
  try {
    // Set a key that expires in 60 seconds
    await redis.set("vibetalk_test", "Redis connection is working perfectly!", "EX", 60);
    const value = await redis.get("vibetalk_test");
    
    res.json({
      success: true,
      message: "Successfully connected to Redis",
      data: value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to connect to Redis",
      error: error.message
    });
  }
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
    redis.sadd("online_users", userId).then(async () => {
      const onlineUserIds = await redis.smembers("online_users");
      io.emit("getOnlineUsers", onlineUserIds);
    }).catch(e => {
      console.error("Redis sadd error:", e.message || e);
      // Fallback to local memory if Redis fails
      io.emit("getOnlineUsers", [...userSocketMap.keys()]);
    });
  }

  socket.on("disconnect", () => {
    userSocketMap.delete(userId);
    redis.srem("online_users", userId).then(async () => {
      const onlineUserIds = await redis.smembers("online_users");
      io.emit("getOnlineUsers", onlineUserIds);
    }).catch(e => {
      console.error("Redis srem error:", e.message || e);
      // Fallback to local memory if Redis fails
      io.emit("getOnlineUsers", [...userSocketMap.keys()]);
    });

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

// Always start the HTTP server. Render (and other hosts) set NODE_ENV=production,
// so we must listen regardless of NODE_ENV.
server.listen(PORT, async () => {
  try {
    // Clear the online users list in Redis on server start to prevent stale data if the server crashed
    await redis.del("online_users");
    console.log("Cleared stale online users from Redis");
  } catch (e) {
    console.error("Failed to clear online users from Redis:", e);
  }

  // Connect to CloudAMQP and start the offline message consumer worker
  try {
    const amqpChannel = await connectAMQP();
    if (amqpChannel) {
      console.log("Starting AMQP worker for offline push notifications...");
      amqpChannel.consume("offline_messages", (msg) => {
        if (msg !== null) {
          try {
            const payload = JSON.parse(msg.content.toString());
            console.log(`\n[AMQP WORKER] Received offline message for User ID: ${payload.receiverId}`);
            console.log(`[AMQP WORKER] Action: Triggering Push Notification / Email to User...`);
            console.log(`[AMQP WORKER] Message Text: "${payload.text}"`);
            
            // TODO: Integrate Firebase Cloud Messaging (FCM) or Nodemailer here!

            // Acknowledge the message so it's removed from the queue
            amqpChannel.ack(msg);
          } catch (err) {
            console.error("Error processing AMQP message:", err);
            // If it's a fatal error, you could nack it: amqpChannel.nack(msg);
          }
        }
      });
    }
  } catch (e) {
    console.error("Failed to start AMQP worker:", e);
  }

  // Schedule MongoDB Index building every day at 2:30 AM IST
  cron.schedule("30 2 * * *", () => {
    console.log("Running scheduled MongoDB index build (2:30 AM IST)...");
    buildAllIndexes();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
  console.log("Scheduled automated index building at 2:30 AM IST.");

  console.log(`Server is running on port ${PORT}`);
});

export default app;
