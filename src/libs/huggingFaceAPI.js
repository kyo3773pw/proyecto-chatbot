// src/libs/huggingFaceAPI.js
import dotenv from 'dotenv';
import path from 'path';

// Cargar las variables de entorno desde el archivo .env en el directorio raíz
dotenv.config({ path: path.resolve('./.env') });

import axios from 'axios';

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

if (!HUGGING_FACE_API_KEY) {
    console.error('HUGGING_FACE_API_KEY is not set');
    throw new Error('HUGGING_FACE_API_KEY is not set');
} else {
    console.log('HUGGING_FACE_API_KEY is loaded');
}

const apiClient = axios.create({
    baseURL: 'https://api-inference.huggingface.co/models',
    headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` }
});

export const queryModel = async (inputs) => {
    const model = 'facebook/blenderbot-400M-distill'; // Especifica el modelo aquí
    const prompt = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: ${inputs}\nAI:`;

    try {
        const response = await apiClient.post(`/${model}`, { inputs: prompt });
        return response.data;
    } catch (error) {
        console.error('Error querying the Hugging Face API:', error.response ? error.response.data : error.message);
        throw error;
    }
};