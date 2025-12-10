import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
  createGroup,
  getGroups,
  getGroupRequests,
  acceptGroupRequest,
  declineGroupRequest,
  getGroupMessages,
  sendGroupMessage,
  leaveGroup,
  getMessageInfo,
  editGroupMessage,
  deleteGroupMessageForMe,
  deleteGroupMessageForEveryone,
} from "../controller/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getGroups);
groupRouter.get("/requests", protectRoute, getGroupRequests);
groupRouter.put("/requests/:id/accept", protectRoute, acceptGroupRequest);
groupRouter.put("/requests/:id/decline", protectRoute, declineGroupRequest);
groupRouter.get("/:groupId/messages", protectRoute, getGroupMessages);
groupRouter.post("/:groupId/messages", protectRoute, sendGroupMessage);
groupRouter.get(
  "/:groupId/messages/:messageId/info",
  protectRoute,
  getMessageInfo
);
groupRouter.put(
  "/:groupId/messages/:messageId/edit",
  protectRoute,
  editGroupMessage
);
groupRouter.delete(
  "/:groupId/messages/:messageId/delete/me",
  protectRoute,
  deleteGroupMessageForMe
);
groupRouter.delete(
  "/:groupId/messages/:messageId/delete/everyone",
  protectRoute,
  deleteGroupMessageForEveryone
);
groupRouter.delete("/:groupId/leave", protectRoute, leaveGroup);

export default groupRouter;
