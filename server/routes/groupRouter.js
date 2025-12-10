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
} from "../controller/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getGroups);
groupRouter.get("/requests", protectRoute, getGroupRequests);
groupRouter.put("/requests/:id/accept", protectRoute, acceptGroupRequest);
groupRouter.put("/requests/:id/decline", protectRoute, declineGroupRequest);
groupRouter.get("/:groupId/messages", protectRoute, getGroupMessages);
groupRouter.post("/:groupId/messages", protectRoute, sendGroupMessage);
groupRouter.delete("/:groupId/leave", protectRoute, leaveGroup);

export default groupRouter;
