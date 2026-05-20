import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.js";

import User from "../models/User.js";
import Message from "../models/Message.js";
import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";
import FriendRequest from "../models/FriendRequest.js";
import GroupRequest from "../models/GroupRequest.js";

export const buildAllIndexes = async () => {
  try {
    console.log("Starting MongoDB index build process...");

    console.log("Building User indexes...");
    await User.createIndexes();

    console.log("Building Message indexes...");
    await Message.createIndexes();

    console.log("Building Group indexes...");
    await Group.createIndexes();

    console.log("Building GroupMessage indexes...");
    await GroupMessage.createIndexes();

    console.log("Building FriendRequest indexes...");
    await FriendRequest.createIndexes();

    console.log("Building GroupRequest indexes...");
    await GroupRequest.createIndexes();

    console.log("✅ All MongoDB indexes built successfully.");
  } catch (error) {
    console.error("❌ Error building indexes:", error);
  }
};

// If this script is run directly (not imported), execute it
if (process.argv[1] === new URL(import.meta.url).pathname) {
  (async () => {
    await connectDB();
    await buildAllIndexes();
    await disconnectDB();
    process.exit(0);
  })();
}
