import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body; // 6-digit userId
    const senderId = req.userId;

    // Find the receiver by their 6-digit userId
    const receiver = await User.findOne({ userId });

    if (!receiver) {
      return res.status(404).json({ message: "User not found with this ID" });
    }

    if (receiver._id.toString() === senderId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiver._id)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // If sender has blocked receiver, prevent sending until unblocked
    if (
      sender.blocked &&
      sender.blocked.map(String).includes(String(receiver._id))
    ) {
      return res.status(403).json({
        message: "You have blocked this user. Unblock to send requests.",
        blockedUserId: receiver._id,
      });
    }

    // If receiver blocked sender, reject
    if (
      receiver.blocked &&
      receiver.blocked.map(String).includes(String(senderId))
    ) {
      return res.status(403).json({
        message: "You are blocked from sending friend requests to this user",
      });
    }

    // If receiver blocked sender, reject
    if (
      receiver.blocked &&
      receiver.blocked.map(String).includes(String(senderId))
    ) {
      return res.status(403).json({
        message: "You are blocked from sending friend requests to this user",
      });
    }

    // Check if a friend request document exists in either direction
    let existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiver._id },
        { sender: receiver._id, receiver: senderId },
      ],
    });

    if (existingRequest) {
      // If it's still pending, user can't send another
      if (existingRequest.status === "pending") {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      // Otherwise reuse the existing doc: reset fields and set to pending
      existingRequest.sender = senderId;
      existingRequest.receiver = receiver._id;
      existingRequest.status = "pending";
      existingRequest.updatedAt = Date.now();
      await existingRequest.save();
    } else {
      // Create new friend request
      const friendRequest = new FriendRequest({
        sender: senderId,
        receiver: receiver._id,
      });
      try {
        await friendRequest.save();
        existingRequest = friendRequest;
      } catch (saveErr) {
        if (saveErr && saveErr.code === 11000) {
          return res
            .status(400)
            .json({ message: "Friend request already exists" });
        }
        console.error("Error saving friend request:", saveErr);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    // Emit socket event to receiver
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const receiverSocketId =
      userSocketMap &&
      userSocketMap.get &&
      userSocketMap.get(receiver._id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", {
        _id: existingRequest._id,
        sender: {
          _id: sender._id,
          fullName: sender.fullName,
          ProfilePic: sender.ProfilePic,
          userId: sender.userId,
        },
        createdAt: existingRequest.createdAt,
      });
    }

    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const friendRequests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "fullName ProfilePic userId")
      .sort({ createdAt: -1 });

    res.status(200).json(friendRequests);
  } catch (error) {
    console.error("Error in getFriendRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get blocked users for current user
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate(
      "blocked",
      "fullName ProfilePic userId"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ blocked: user.blocked || [] });
  } catch (error) {
    console.error("Error in getBlockedUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Update friend request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add to each other's friend lists
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender },
    });

    // Emit socket event to sender
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const senderSocketId =
      userSocketMap &&
      userSocketMap.get &&
      userSocketMap.get(friendRequest.sender.toString());
    if (senderSocketId) {
      const acceptedUser = await User.findById(userId).select(
        "fullName ProfilePic userId"
      );
      io.to(senderSocketId).emit("friendRequestAccepted", {
        _id: acceptedUser._id,
        fullName: acceptedUser.fullName,
        ProfilePic: acceptedUser.ProfilePic,
        userId: acceptedUser.userId,
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decline friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Update friend request status
    friendRequest.status = "declined";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Remove from both friend lists
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    // Emit socket event to the removed friend
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const friendSocketId =
      userSocketMap && userSocketMap.get && userSocketMap.get(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit("friendRemoved", { userId });
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block a user (prevent them from sending friend requests)
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params; // the user to block
    const me = req.userId;

    if (me === userId)
      return res.status(400).json({ message: "Cannot block yourself" });

    // Add to blocked list and remove friendship if exists
    await User.findByIdAndUpdate(me, {
      $addToSet: { blocked: userId },
      $pull: { friends: userId },
    });
    await User.findByIdAndUpdate(userId, { $pull: { friends: me } });

    // Remove any existing friend requests between users
    await FriendRequest.deleteMany({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    });

    res.status(200).json({ message: "User blocked" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.userId;

    // Ensure target exists
    const target = await User.findById(userId).select(
      "fullName ProfilePic userId blocked"
    );
    if (!target) return res.status(404).json({ message: "User not found" });

    // Remove from current user's blocked list
    await User.findByIdAndUpdate(me, { $pull: { blocked: userId } });

    // If the target still blocks the current user, do not auto-friend
    if (target.blocked && target.blocked.map(String).includes(String(me))) {
      return res.status(200).json({
        message: "User unblocked but they still block you; cannot auto-friend",
      });
    }

    // Add each other as friends (idempotent via $addToSet)
    await User.findByIdAndUpdate(me, { $addToSet: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: me } });

    // Emit socket event to notify both users of the new friendship
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    const myBasic = await User.findById(me).select(
      "fullName ProfilePic userId"
    );
    const theirBasic = target; // already selected

    try {
      const mySocketId =
        userSocketMap && userSocketMap.get && userSocketMap.get(String(me));
      const theirSocketId =
        userSocketMap && userSocketMap.get && userSocketMap.get(String(userId));

      if (theirSocketId && io) {
        io.to(theirSocketId).emit("friendAdded", {
          _id: myBasic._id,
          fullName: myBasic.fullName,
          ProfilePic: myBasic.ProfilePic,
          userId: myBasic.userId,
        });
      }

      if (mySocketId && io) {
        io.to(mySocketId).emit("friendAdded", {
          _id: theirBasic._id,
          fullName: theirBasic.fullName,
          ProfilePic: theirBasic.ProfilePic,
          userId: theirBasic.userId,
        });
      }
    } catch (emitErr) {
      console.warn(
        "Failed to emit friendAdded sockets:",
        emitErr.message || emitErr
      );
    }

    res.status(200).json({ message: "User unblocked and friended" });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
