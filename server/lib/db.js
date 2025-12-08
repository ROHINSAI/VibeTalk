import mongoose from "mongoose";

/**
 * @param {string} [uri]
 */
export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error(
      "MONGO_URI is not defined. Pass a uri or set MONGO_URI in env."
    );
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
    throw err;
  }
}

export default mongoose;
