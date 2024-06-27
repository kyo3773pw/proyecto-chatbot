// src/routes/chatbot.routes.js
import { Router } from 'express';
import { handleQuery } from '../controllers/chatbot.controller.js';

const router = Router();

router.post('/chatbot', handleQuery); // Esta ruta debe coincidir con la URL en el frontend

export default router;
