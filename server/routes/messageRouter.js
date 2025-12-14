import express from "express";
import multer from "multer";
import { protectRoute } from "../middlewares/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  markMessagesAsSeen,
  sendMessage,
  deleteForMe,
  deleteForEveryone,
  editMessage,
  starMessage,
  unstarMessage,
  getStarredMessages,
  isMessageStarred,
} from "../controller/messageController.js";
const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
// Star routes (static) must come before the dynamic userId route to avoid collisions
messageRouter.get("/starred", protectRoute, getStarredMessages);
messageRouter.get("/star/:id", protectRoute, isMessageStarred);
messageRouter.post("/star/:id", protectRoute, starMessage);
messageRouter.delete("/star/:id", protectRoute, unstarMessage);
messageRouter.put("/seen/:id", protectRoute, markMessagesAsSeen);
const upload = multer({ storage: multer.memoryStorage() });
// accept optional audio and waveform files via multipart/form-data
messageRouter.post(
  "/send/:userId",
  protectRoute,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "waveform", maxCount: 1 },
  ]),
  sendMessage
);
messageRouter.delete("/delete/me/:id", protectRoute, deleteForMe);
messageRouter.delete("/delete/everyone/:id", protectRoute, deleteForEveryone);
messageRouter.put("/edit/:id", protectRoute, editMessage);
// Dynamic route for fetching messages with a specific user (keep last)
messageRouter.get("/:userId", protectRoute, getMessages);
export default messageRouter;
