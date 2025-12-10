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

    // Exclude messages that the current user has deleted for themselves
    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        {
          $or: [
            { deletedFor: { $exists: false } },
            { deletedFor: { $nin: [userId] } },
          ],
        },
      ],
    }).sort({ createdAt: 1 });

    // Find messages that will be marked seen so we can notify senders
    const messagesToMark = await Message.find({
      senderId: otherUserId,
      receiverId: userId,
      seen: false,
    }).select("_id senderId");

    const messageIdsToMark = messagesToMark.map((m) => m._id.toString());

    if (messageIdsToMark.length > 0) {
      await Message.updateMany(
        { senderId: otherUserId, receiverId: userId, seen: false },
        { $set: { seen: true } }
      );

      // Emit seen notification to the sender's socket
      try {
        const senderSocketId =
          userSocketMap.get && userSocketMap.get(otherUserId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesSeen", {
            by: userId,
            messageIds: messageIdsToMark,
          });
        }
      } catch (emitErr) {
        console.warn(
          "Failed to emit messagesSeen:",
          emitErr.message || emitErr
        );
      }
    }

    // update current user's lastSeen
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    } catch (e) {
      console.warn("Failed to update lastSeen on getMessages:", e.message || e);
    }

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

export const deleteForMe = async (req, res) => {
  try {
    const { id } = req.params; // message id
    const me = req.userId;

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // If user already deleted for themselves, return success
    if (msg.deletedFor && msg.deletedFor.map(String).includes(String(me))) {
      return res.status(200).json({ message: "Deleted for you" });
    }

    msg.deletedFor = [...(msg.deletedFor || []), me];
    await msg.save();

    res.status(200).json({ message: "Deleted for you" });
  } catch (error) {
    console.error("Error in deleteForMe:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const deleteForEveryone = async (req, res) => {
  try {
    const { id } = req.params; // message id
    const me = req.userId;

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Only sender can delete for everyone
    if (msg.senderId.toString() !== me.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete for everyone" });
    }

    await Message.findByIdAndDelete(id);

    // emit socket event to receiver (so they can remove message)
    const receiverSocketId =
      userSocketMap.get && userSocketMap.get(msg.receiverId.toString());
    try {
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId: id });
      }
      const mySocketId = userSocketMap.get && userSocketMap.get(me.toString());
      if (mySocketId) {
        io.to(mySocketId).emit("messageDeleted", { messageId: id });
      }
    } catch (emitErr) {
      console.warn(
        "Failed to emit messageDeleted:",
        emitErr.message || emitErr
      );
    }

    res.status(200).json({ message: "Deleted for everyone" });
  } catch (error) {
    console.error("Error in deleteForEveryone:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const starMessage = async (req, res) => {
  try {
    const { id } = req.params; // message id
    const me = req.userId;

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    await User.findByIdAndUpdate(me, { $addToSet: { starredMessages: id } });
    res.status(200).json({ message: "Starred" });
  } catch (error) {
    console.error("Error in starMessage:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const unstarMessage = async (req, res) => {
  try {
    const { id } = req.params; // message id
    const me = req.userId;

    await User.findByIdAndUpdate(me, { $pull: { starredMessages: id } });
    res.status(200).json({ message: "Unstarred" });
  } catch (error) {
    console.error("Error in unstarMessage:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getStarredMessages = async (req, res) => {
  try {
    const me = req.userId;
    const user = await User.findById(me).populate({
      path: "starredMessages",
      populate: [
        { path: "senderId", select: "fullName ProfilePic userId" },
        { path: "receiverId", select: "fullName ProfilePic userId" },
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ starred: user.starredMessages || [] });
  } catch (error) {
    console.error("Error in getStarredMessages:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const isMessageStarred = async (req, res) => {
  try {
    const { id } = req.params;
    const me = req.userId;
    const user = await User.findById(me).select("starredMessages");
    const starred = user?.starredMessages?.map(String).includes(String(id));
    res.status(200).json({ starred: !!starred });
  } catch (error) {
    console.error("Error in isMessageStarred:", error);
    res.status(500).json({ message: "Server error." });
  }
};
