import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Generate unique 6-digit userId
const generateUserId = async () => {
  let userId;
  let isUnique = false;

  while (!isUnique) {
    userId = Math.floor(100000 + Math.random() * 900000).toString();
    const existingUser = await User.findOne({ userId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return userId;
};

export const SignUp = async (req, res) => {
  try {
    const { email, fullName, password, bio } = req.body;

    if (!email || !fullName || !password || !bio) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = await generateUserId();

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
      bio,
      userId,
    });
    const token = generateToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error in SignUp:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful." });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const Logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Error in Logout:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const GetCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in GetCurrentUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { fullName, bio, profilePicture } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;

    if (profilePicture) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profilePicture, {
          folder: "profiles",
        });

        if (uploadResult?.secure_url) {
          user.ProfilePic = uploadResult.secure_url;
        }
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({
          message: "Failed to upload profile picture.",
        });
      }
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Profile updated successfully.",
      user: userObj,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};
