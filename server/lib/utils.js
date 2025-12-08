import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Generates a JWT token for a given user ID.
 * @param {string} userId - The user ID to encode in the token.
 * @returns {string} - The generated JWT token.
 */

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a JWT token and extracts the user ID.
 * @param {string} token - The JWT token to verify.
 * @returns {string|null} - The extracted user ID or null if invalid.
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
