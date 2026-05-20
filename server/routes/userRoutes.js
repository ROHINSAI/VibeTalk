import express from "express";
import {
  Login,
  SignUp,
  updateProfile,
  Logout,
} from "../controller/userController.js";
import User from "../models/User.js";
import { protectRoute, checkAuth } from "../middlewares/auth.js";

import { getOrSetCache } from "../lib/redis.js";

const userRouter = express.Router();

userRouter.post("/signup", SignUp);
userRouter.post("/login", Login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.post("/logout", protectRoute, Logout);
userRouter.get("/check", protectRoute, async (req, res) => {
  try {
    const user = await getOrSetCache(`userProfile:${req.userId}`, 3600, async () => {
      return await User.findById(req.userId).select("-password").lean();
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ authenticated: true, user });
  } catch (error) {
    console.error("Error in /check:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default userRouter;
