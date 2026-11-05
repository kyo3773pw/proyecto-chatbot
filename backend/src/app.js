import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { authRouter } from './routes/auth.routes.js';
import { eventRouter } from './routes/event.routes.js';

export function createApp() {
    const app = express();

    app.disable('x-powered-by');
    app.use(cors({ origin: config.corsOrigin, credentials: true }));
    app.use(express.json({ limit: '100kb' }));
    app.use(cookieParser());

    app.get('/api/health', (req, res) => res.json({ ok: true }));
    app.use('/api/auth', authRouter);
    app.use('/api/admin/events', eventRouter);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}
