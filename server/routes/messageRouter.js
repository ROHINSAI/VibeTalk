import express from "express";
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
messageRouter.post("/send/:userId", protectRoute, sendMessage);
messageRouter.delete("/delete/me/:id", protectRoute, deleteForMe);
messageRouter.delete("/delete/everyone/:id", protectRoute, deleteForEveryone);
messageRouter.put("/edit/:id", protectRoute, editMessage);
// Dynamic route for fetching messages with a specific user (keep last)
messageRouter.get("/:userId", protectRoute, getMessages);
export default messageRouter;
