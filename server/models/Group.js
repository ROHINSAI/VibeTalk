import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupPic: { type: String, default: "" },
  },
  { timestamps: true }
);

// Optimize fetching groups for a specific user
groupSchema.index({ members: 1 });

const Group = mongoose.model("Group", groupSchema);

export default Group;
