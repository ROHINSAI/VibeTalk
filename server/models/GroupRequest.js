import mongoose from "mongoose";

const groupRequestSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    hasNonFriendMembers: { type: Boolean, default: false },
    nonFriendNames: [{ type: String }],
  },
  { timestamps: true }
);

// Unique constraint: one pending request per group per receiver
groupRequestSchema.index(
  { group: 1, receiver: 1 },
  { unique: true, sparse: true }
);

const GroupRequest = mongoose.model("GroupRequest", groupRequestSchema);

export default GroupRequest;
