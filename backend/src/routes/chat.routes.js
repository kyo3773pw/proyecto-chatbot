import { Router } from 'express';
import { preguntar  } from '../controllers/chat.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const chatRouter = Router();

//cualquier ususario con sesion protege la cuota del LLM sin limadtor propio.
chatRouter.post('/', requireAuth, preguntar);