// src/routes/chatbot.routes.js
import express from 'express';
import { getChatbotResponse } from '../controllers/chatbot.controller.js';

const router = express.Router();

router.post('/chatbot', getChatbotResponse);

export default router;
