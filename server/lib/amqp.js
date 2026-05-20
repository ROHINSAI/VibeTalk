import amqp from "amqplib";
import "dotenv/config";

const CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || "";
const QUEUE_NAME = "offline_messages";

let channel = null;

export const connectAMQP = async () => {
  if (!CLOUDAMQP_URL) {
    console.warn("⚠️ CLOUDAMQP_URL is not defined in .env. Offline message queueing is disabled.");
    return null;
  }

  try {
    const connection = await amqp.connect(CLOUDAMQP_URL);
    channel = await connection.createChannel();
    
    // Assert the queue exists
    await channel.assertQueue(QUEUE_NAME, {
      durable: true, // Messages survive a broker restart
    });

    console.log("✅ Connected to CloudAMQP successfully");
    return channel;
  } catch (error) {
    console.error("❌ CloudAMQP connection error:", error.message || error);
    return null;
  }
};

/**
 * Publish a message to the offline queue
 * @param {Object} payload 
 */
export const publishOfflineMessage = (payload) => {
  if (!channel) return;
  
  try {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
      persistent: true, // Save message to disk in RabbitMQ
    });
  } catch (error) {
    console.error("Failed to publish to AMQP:", error.message || error);
  }
};

export const getAMQPChannel = () => channel;
