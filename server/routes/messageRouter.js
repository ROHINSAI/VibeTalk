import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  markMessagesAsSeen,
  sendMessage,
} from "../controller/messageController.js";
const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:userId", protectRoute, getMessages);
messageRouter.put("/seen/:id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send/:userId", protectRoute, sendMessage);
export default messageRouter;
