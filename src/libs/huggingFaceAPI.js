import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

//dotenv.config({ path: path.resolve(__dirname, '../libs/.env') });

const HUGGING_FACE_API_KEY = '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';

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
    const model = 'mistralai/Mistral-7B-Instruct-v0.3'; // Especifica el modelo aquí

    try {
        const postData = {
            inputs // Instrucción sin modificaciones
        };

        const response = await apiClient.post(`/${model}`, postData);
        return response.data; // Devuelve la respuesta completa
    } catch (error) {
        console.error('Error querying the Hugging Face API:', error.response ? error.response.data : error.message);
        throw error;
    }
};