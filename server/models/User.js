import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    ProfilePic: { type: String, default: "" },
    bio: { type: String, default: "" },
    userId: { type: String, required: true, unique: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    starredMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
