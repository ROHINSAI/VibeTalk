import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    text: { type: String, default: "" },
    image: { type: String, default: "" },
    audio: { type: String, default: "" },
    waveform: { type: String, default: "" },
    edited: { type: Boolean, default: false },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Optimize fetching group chat history in chronological order
groupMessageSchema.index({ groupId: 1, createdAt: -1 });

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

export default GroupMessage;
