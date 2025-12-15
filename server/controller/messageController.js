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
    }).sort({ createdAt: 1 }).populate("replyTo", "text senderId audio image");

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
    const { text, image, replyTo } = req.body;
    // multer places files in req.files when using upload.fields
    const files = req.files || {};
    const senderId = req.userId;
    const receiverId = req.params.userId;

    let imageUrl;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "vibetalk/messages",
      });
      imageUrl = uploadResult.secure_url;
    }

    let audioUrl;
    let waveformUrl;
    // If multipart audio file uploaded via multer
    if (files.audio && files.audio[0]) {
      const buf = files.audio[0].buffer;
      const dataUri = `data:${files.audio[0].mimetype};base64,${buf.toString(
        "base64"
      )}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "vibetalk/messages",
        resource_type: "auto",
      });
      audioUrl = uploadResult.secure_url;
    } else if (req.body.audio) {
      const uploadResult = await cloudinary.uploader.upload(req.body.audio, {
        folder: "vibetalk/messages",
        resource_type: "auto",
      });
      audioUrl = uploadResult.secure_url;
    }

    // waveform image upload if provided
    if (files.waveform && files.waveform[0]) {
      const wfBuf = files.waveform[0].buffer;
      const wfDataUri = `data:${
        files.waveform[0].mimetype
      };base64,${wfBuf.toString("base64")}`;
      const wfRes = await cloudinary.uploader.upload(wfDataUri, {
        folder: "vibetalk/messages/waveforms",
      });
      waveformUrl = wfRes.secure_url;
    } else if (req.body.waveform) {
      const wfRes = await cloudinary.uploader.upload(req.body.waveform, {
        folder: "vibetalk/messages/waveforms",
      });
      waveformUrl = wfRes.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      waveform: waveformUrl,
      seen: false,
      replyTo: replyTo || null,
    });

    await newMessage.save();
    
    await newMessage.populate("replyTo", "text senderId audio image");

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

    // Check if it's a regular message or group message
    const msg = await Message.findById(id);
    if (!msg) {
      // Try checking GroupMessage
      const GroupMessage = (await import("../models/GroupMessage.js")).default;
      const groupMsg = await GroupMessage.findById(id);
      if (!groupMsg)
        return res.status(404).json({ message: "Message not found" });
    }

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
    const user = await User.findById(me);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Manually populate both Message and GroupMessage
    const GroupMessage = (await import("../models/GroupMessage.js")).default;
    const starredIds = user.starredMessages || [];

    const regularMessages = await Message.find({ _id: { $in: starredIds } })
      .populate("senderId", "fullName ProfilePic userId")
      .populate("receiverId", "fullName ProfilePic userId");

    const groupMessages = await GroupMessage.find({ _id: { $in: starredIds } })
      .populate("senderId", "fullName ProfilePic userId")
      .populate("groupId", "name groupPic");

    const allStarred = [...regularMessages, ...groupMessages];

    res.status(200).json({ starred: allStarred });
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

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params; // message id
    const me = req.userId;
    const { text } = req.body;

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Only sender can edit
    if (msg.senderId.toString() !== me.toString()) {
      return res.status(403).json({ message: "Not authorized to edit" });
    }

    // update text and mark edited
    msg.text = typeof text === "string" ? text : msg.text;
    msg.edited = true;
    await msg.save();

    // emit socket event to both parties so UI can update
    try {
      const receiverSocketId =
        userSocketMap.get && userSocketMap.get(msg.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageEdited", msg);
      }
      const mySocketId = userSocketMap.get && userSocketMap.get(me.toString());
      if (mySocketId) {
        io.to(mySocketId).emit("messageEdited", msg);
      }
    } catch (emitErr) {
      console.warn("Failed to emit messageEdited:", emitErr.message || emitErr);
    }

    res.status(200).json({ message: "Edited", msg });
  } catch (error) {
    console.error("Error in editMessage:", error);
    res.status(500).json({ message: "Server error." });
  }
};
