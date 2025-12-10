import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.userId;

    // Get current user with populated friends
    const currentUser = await User.findById(userId).populate(
      "friends",
      "-password"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return only friends
    const filteredUsers = currentUser.friends;

    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.status(200).json({ users: filteredUsers, unseenMessages });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.status(200).json({ message: "Messages marked as seen." });
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.userId;
    const receiverId = req.params.userId;

    let imageUrl;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "vibetalk/messages",
      });
      imageUrl = uploadResult.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      seen: false,
    });

    await newMessage.save();

    const receiverSocketId = userSocketMap.get && userSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ message: "Message sent successfully.", newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Server error." });
  }
};
