import express from "express";
import {
  Login,
  SignUp,
  updateProfile,
  Logout,
} from "../controller/userController.js";
import User from "../models/User.js";
import { protectRoute, checkAuth } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", SignUp);
userRouter.post("/login", Login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.post("/logout", protectRoute, Logout);
userRouter.get("/check", protectRoute, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ authenticated: true, user });
});
export default userRouter;
