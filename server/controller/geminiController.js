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

export const chatWithGemini = async (req, res) => {
  try {
    const { message, history, contacts } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { responseMimeType: "application/json" }, // Force JSON mode if possible, but for mixed mode we might need text
      // Actually, for mixed text/JSON, it's safer to ask for JSON only when needed or parse it.
      // Let's stick to text output but structured prompt for now to allow normal convos.
    });

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

    const chat = model.startChat({
      history: chatHistory,
    });

    // Inject contacts into the current message context implicitly or explicitly
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
      // In case it wraps in markdown
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const actionData = JSON.parse(cleanText);
      
      // If valid JSON action, return it
      if (actionData.action) {
        return res.json({ reply: actionData, isAction: true });
      }
    } catch (e) {
      // Not JSON, just normal text
    }

    res.json({ reply: text, isAction: false });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const status = error.status || 500;
    const message = error.message || "Failed to process request with Gemini";
    res.status(status).json({ error: message });
  }
};
