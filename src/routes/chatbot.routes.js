// src/routes/chatbot.routes.js
import { Router } from 'express';
import { getResponse } from '../controllers/chatbot.controller.js';

const router = Router();

router.post('/chatbot', getResponse); // Esta ruta debe coincidir con la URL en el frontend

export default router;
