// src/controllers/chatbot.controller.js
import { queryModel } from '../libs/huggingFaceAPI.js';

export const getChatbotResponse = async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await queryModel(userMessage);  // Utilizando queryModel para obtener la respuesta del modelo
        res.json({ response: response.generated_text });
    } catch (error) {
        console.error('Error getting chatbot response:', error);
        res.status(500).json({ error: 'Error getting chatbot response' });
    }
};
