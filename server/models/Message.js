import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "" },
    image: { type: String, default: "" },
    audio: { type: String, default: "" },
    waveform: { type: String, default: "" },
    seen: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

// Optimize unseen messages query in sidebar
messageSchema.index({ receiverId: 1, senderId: 1, seen: 1 });
// Optimize fetching chat history in chronological order
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
