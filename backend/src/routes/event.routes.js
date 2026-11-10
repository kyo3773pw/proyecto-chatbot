import { Router } from 'express';
import { createEvent, extractEvent, listEvents, importEvents} from '../controllers/event.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

export const eventRouter = Router();

// todo lo de este router es solo para admin.
eventRouter.use(requireAuth, requireRole('admin'));
eventRouter.post('/import', importEvents);
eventRouter.post('/', createEvent);
eventRouter.get('/', listEvents);
eventRouter.post('/extract', extractEvent);
