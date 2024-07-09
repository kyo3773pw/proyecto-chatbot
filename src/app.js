// src/app.js
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';


import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';

import eventRoutes from './routes/event.routes.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Ajusta esto según tu configuración de frontend
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', taskRoutes);
app.use('/api', chatbotRoutes);

app.use('/api', eventRoutes);

export default app;