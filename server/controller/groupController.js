import Group from "../models/Group.js";
import GroupRequest from "../models/GroupRequest.js";
import GroupMessage from "../models/GroupMessage.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds, groupPic } = req.body;
    const creatorId = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!memberIds || memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one member must be selected" });
    }

    // Create the group
    const group = new Group({
      name: name.trim(),
      description: description?.trim() || "",
      creator: creatorId,
      members: [creatorId], // Creator is automatically a member
      admins: [creatorId], // Creator is automatically an admin
      groupPic: groupPic || "",
    });

    await group.save();

    // Get creator's friend list
    const creator = await User.findById(creatorId).select("friends");
    const friendIds = creator.friends.map((id) => String(id));

    // Create group requests for each selected member
    const groupRequests = [];
    for (const memberId of memberIds) {
      if (String(memberId) === String(creatorId)) continue; // Skip creator

      // Check if the member has non-friend members in the group
      const member = await User.findById(memberId).select("friends");
      const memberFriendIds = member.friends.map((id) => String(id));

      const nonFriendMembers = memberIds.filter(
        (id) =>
          String(id) !== String(memberId) &&
          !memberFriendIds.includes(String(id))
      );

      const hasNonFriendMembers = nonFriendMembers.length > 0;
      let nonFriendNames = [];

      if (hasNonFriendMembers) {
        const nonFriends = await User.find({
          _id: { $in: nonFriendMembers },
        }).select("fullName");
        nonFriendNames = nonFriends.map((u) => u.fullName);
      }

      const groupRequest = new GroupRequest({
        group: group._id,
        receiver: memberId,
        sender: creatorId,
        hasNonFriendMembers,
        nonFriendNames,
      });

      await groupRequest.save();
      groupRequests.push(groupRequest);

      // Emit socket event to notify the receiver
      const receiverSocketId =
        userSocketMap.get && userSocketMap.get(String(memberId));
      if (receiverSocketId) {
        const populatedRequest = await GroupRequest.findById(groupRequest._id)
          .populate("sender", "fullName ProfilePic userId")
          .populate("group", "name description");
        io.to(receiverSocketId).emit("newGroupRequest", populatedRequest);
      }
    }

    res.status(201).json({
      message: "Group created and invitations sent",
      group,
      requestsSent: groupRequests.length,
    });
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.userId;

    const groups = await Group.find({ members: userId })
      .populate("creator", "fullName ProfilePic userId")
      .populate("members", "fullName ProfilePic userId")
      .sort({ updatedAt: -1 });

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error in getGroups:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGroupRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await GroupRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "fullName ProfilePic userId")
      .populate("group", "name description creator")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error in getGroupRequests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptGroupRequest = async (req, res) => {
  try {
    const { id } = req.params; // request id
    const userId = req.userId;

    const request = await GroupRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (String(request.receiver) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add user to group members
    const group = await Group.findById(request.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Emit socket event to all group members
    const populatedGroup = await Group.findById(group._id)
      .populate("creator", "fullName ProfilePic userId")
      .populate("members", "fullName ProfilePic userId");

    group.members.forEach((memberId) => {
      const memberSocketId =
        userSocketMap.get && userSocketMap.get(String(memberId));
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", populatedGroup);
      }
    });

    res.status(200).json({ message: "Joined group", group: populatedGroup });
  } catch (error) {
    console.error("Error in acceptGroupRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const declineGroupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const request = await GroupRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (String(request.receiver) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "declined";
    await request.save();

    res.status(200).json({ message: "Request declined" });
  } catch (error) {
    console.error("Error in declineGroupRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    // Verify user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => String(m) === String(userId))) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Get messages not deleted by this user
    const messages = await GroupMessage.find({
      groupId,
      deletedFor: { $nin: [userId] },
    })
      .populate("senderId", "fullName ProfilePic userId")
      .sort({ createdAt: 1 });

    // Mark messages as seen by this user
    const unseenMessages = await GroupMessage.find({
      groupId,
      seenBy: { $nin: [userId] },
      senderId: { $ne: userId },
    });

    if (unseenMessages.length > 0) {
      await GroupMessage.updateMany(
        {
          groupId,
          seenBy: { $nin: [userId] },
          senderId: { $ne: userId },
        },
        { $addToSet: { seenBy: userId } }
      );
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.userId;

    // Verify user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => String(m) === String(senderId))) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const message = new GroupMessage({
      senderId,
      groupId,
      text: text || "",
      image: image || "",
      seenBy: [senderId],
    });

    await message.save();

    const populatedMessage = await GroupMessage.findById(message._id).populate(
      "senderId",
      "fullName ProfilePic userId"
    );

    // Emit to all group members
    group.members.forEach((memberId) => {
      const memberSocketId =
        userSocketMap.get && userSocketMap.get(String(memberId));
      if (memberSocketId) {
        io.to(memberSocketId).emit("newGroupMessage", populatedMessage);
      }
    });

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Remove user from members and admins
    group.members = group.members.filter((m) => String(m) !== String(userId));
    group.admins = group.admins.filter((a) => String(a) !== String(userId));

    // If creator leaves and there are other members, assign a new admin
    if (String(group.creator) === String(userId) && group.members.length > 0) {
      if (group.admins.length === 0) {
        group.admins.push(group.members[0]);
      }
      group.creator = group.members[0];
    }

    // If no members left, delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await GroupMessage.deleteMany({ groupId });
      return res.status(200).json({ message: "Group deleted" });
    }

    await group.save();

    // Notify remaining members
    group.members.forEach((memberId) => {
      const memberSocketId =
        userSocketMap.get && userSocketMap.get(String(memberId));
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", group);
      }
    });

    res.status(200).json({ message: "Left group" });
  } catch (error) {
    console.error("Error in leaveGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessageInfo = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.userId;

    // Verify user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => String(m) === String(userId))) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const message = await GroupMessage.findById(messageId).populate(
      "seenBy",
      "fullName ProfilePic userId"
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ seenBy: message.seenBy || [] });
  } catch (error) {
    console.error("Error in getMessageInfo:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editGroupMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    // Verify user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => String(m) === String(userId))) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can edit
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.text = text;
    message.edited = true;
    await message.save();

    const populatedMessage = await GroupMessage.findById(message._id).populate(
      "senderId",
      "fullName ProfilePic userId"
    );

    // Emit to all group members
    group.members.forEach((memberId) => {
      const memberSocketId =
        userSocketMap.get && userSocketMap.get(String(memberId));
      if (memberSocketId) {
        io.to(memberSocketId).emit("messageEdited", populatedMessage);
      }
    });

    res.status(200).json({ message: populatedMessage });
  } catch (error) {
    console.error("Error in editGroupMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGroupMessageForMe = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => String(m) === String(userId))) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.status(200).json({ message: "Deleted for you" });
  } catch (error) {
    console.error("Error in deleteGroupMessageForMe:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGroupMessageForEveryone = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => String(m) === String(userId))) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete for everyone
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await GroupMessage.findByIdAndDelete(messageId);

    // Emit to all group members
    group.members.forEach((memberId) => {
      const memberSocketId =
        userSocketMap.get && userSocketMap.get(String(memberId));
      if (memberSocketId) {
        io.to(memberSocketId).emit("messageDeleted", { messageId });
      }
    });

    res.status(200).json({ message: "Deleted for everyone" });
  } catch (error) {
    console.error("Error in deleteGroupMessageForEveryone:", error);
    res.status(500).json({ message: "Server error" });
  }
};
