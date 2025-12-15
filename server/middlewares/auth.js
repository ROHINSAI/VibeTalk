import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
  try {
    // Check Authorization header first, then fall back to cookie
    let token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user;
    req.userId = decoded.userId; // unified
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed." });
  }
};

export const checkAuth = (req, res, next) => {
  let token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // unified
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};

export const protectRoute = (req, res, next) => {
  let token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // unified
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};
