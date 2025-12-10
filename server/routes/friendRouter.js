import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controller/friendController.js";

const router = express.Router();

router.post("/request", protectRoute, sendFriendRequest);
router.get("/requests", protectRoute, getFriendRequests);
router.put("/accept/:requestId", protectRoute, acceptFriendRequest);
router.put("/decline/:requestId", protectRoute, declineFriendRequest);
router.delete("/remove/:friendId", protectRoute, removeFriend);
router.post("/block/:userId", protectRoute, blockUser);
router.delete("/block/:userId", protectRoute, unblockUser);
router.get("/blocked", protectRoute, getBlockedUsers);

export default router;
