import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  markMessagesAsSeen,
  sendMessage,
  deleteForMe,
  deleteForEveryone,
} from "../controller/messageController.js";
const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:userId", protectRoute, getMessages);
messageRouter.put("/seen/:id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send/:userId", protectRoute, sendMessage);
messageRouter.delete("/delete/me/:id", protectRoute, deleteForMe);
messageRouter.delete("/delete/everyone/:id", protectRoute, deleteForEveryone);
export default messageRouter;
