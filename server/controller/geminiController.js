import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instruction for the Gemini model
const SYSTEM_INSTRUCTION = `
You are a helpful and friendly assistant for a messaging app called VibeTalk. 
Keep your responses short, sweet, and concise. Avoid long paragraphs. Use emojis occasionally to keep the vibe fun.

You have the ability to SEND MESSAGES and MAKE CALLS on behalf of the user.
You will be provided with a list of "contacts" in the context.

PROTOCOL FOR ACTIONS:
Only trigger an action if the user EXPLICITLY asks to "send a message to [Name]" or "call [Name]" or "send to [Name]".
If the user just wants to chat with YOU, reply with normal text.

When an action is requested, you MUST output a JSON object in the following format. 
DO NOT wrap the JSON in markdown code blocks. Just output the raw JSON string.

For sending a message:
{ "action": "sendMessage", "recipient": "Closest Name Match from Contacts", "message": "The message content" }

For making a call:
{ "action": "startCall", "recipient": "Closest Name Match from Contacts", "type": "audio" }

If the user asks for something else, just reply with a normal text string.
`;

const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-pro", 
  "gemini-flash-latest",
  "gemini-2.0-flash-exp",
  "gemini-2.5-flash",
  "gemini-exp-1206"
];

export const chatWithGemini = async (req, res) => {
  const { message, history, contacts } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Provide context about contacts
  let contactListString = "No contacts available.";
  if (contacts && Array.isArray(contacts) && contacts.length > 0) {
    contactListString = "My Contacts:\n" + contacts.map(c => `- ${c.fullName}`).join("\n");
  }

  // Format history for Gemini if provided
  let chatHistory = [];
  if (history && Array.isArray(history)) {
    chatHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }],
    }));
  }

  // Iterate through models
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: { responseMimeType: "application/json" },
      });

      const chat = model.startChat({
        history: chatHistory,
      });

      const prompt = `
Context:
${contactListString}

User Message:
${message}
`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      let text = response.text();

      // Try to parse JSON to see if it's an action
      try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const actionData = JSON.parse(cleanText);
        
        if (actionData.action) {
          return res.json({ reply: actionData, isAction: true, modelUsed: modelName });
        }
      } catch (e) {
        // Not JSON
      }

      return res.json({ reply: text, isAction: false, modelUsed: modelName });

    } catch (error) {
      console.warn(`Failed with model ${modelName}:`, error.message);
      lastError = error;
      
      // If the error is NOT a 429 (Rate Limit) or 404 (Not Found), maybe we shouldn't retry?
      // But for robustness, let's retry on almost anything for now, or maybe check status.
      // Usually 429, 503, 500 are good candidates for retry. 400 might be bad request (invalid prompt).
      // Let's assume most errors here are availability/quota related.
      continue;
    }
  }

  // If we get here, all models failed
  console.error("All Gemini models failed. Last error:", lastError);
  const status = lastError?.status || 500;
  const errMsg = lastError?.message || "All AI models are currently unavailable. Please try again later.";
  res.status(status).json({ error: errMsg });
};
