import { Router } from 'express';
import { addEvent } from '../controllers/event.controller.js';

const router = Router();

router.post('/add-event', addEvent);

export default router;
