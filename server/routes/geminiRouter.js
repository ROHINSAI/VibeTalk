import express from "express";
import { chatWithGemini } from "../controller/geminiController.js";

const router = express.Router();

router.post("/chat", chatWithGemini);

export default router;
