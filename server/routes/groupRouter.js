import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import multer from "multer";
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
  promoteToAdmin,
  demoteAdmin,
  updateGroupDetails,
  addMember,
  removeMember,
} from "../controller/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getGroups);
groupRouter.get("/requests", protectRoute, getGroupRequests);
groupRouter.put("/requests/:id/accept", protectRoute, acceptGroupRequest);
groupRouter.put("/requests/:id/decline", protectRoute, declineGroupRequest);
groupRouter.get("/:groupId/messages", protectRoute, getGroupMessages);
const upload = multer({ storage: multer.memoryStorage() });
groupRouter.post(
  "/:groupId/messages",
  protectRoute,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "waveform", maxCount: 1 },
  ]),
  sendGroupMessage
);
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
groupRouter.put("/:groupId/promote/:memberId", protectRoute, promoteToAdmin);
groupRouter.put("/:groupId/demote/:memberId", protectRoute, demoteAdmin);
groupRouter.put("/:groupId/update", protectRoute, updateGroupDetails);
groupRouter.post("/:groupId/add-members", protectRoute, addMember);
groupRouter.delete("/:groupId/remove/:memberId", protectRoute, removeMember);

export default groupRouter;
