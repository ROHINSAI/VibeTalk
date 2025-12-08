import express from "express";
import { Login, SignUp, updateProfile } from "../controller/userController.js";
import { protectRoute, checkAuth } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", SignUp);
userRouter.post("/login", Login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, (req, res) => {
  res.status(200).json({ authenticated: true, userId: req.userId });
});

export default userRouter;
