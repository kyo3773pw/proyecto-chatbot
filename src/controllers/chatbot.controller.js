import { queryModel } from '../libs/huggingFaceAPI.js';

export const handleQuery = async (req, res) => {
    try {
        const { inputs } = req.body;
        if (typeof inputs !== 'string') {
            throw new Error('Inputs must be a string');
        }
        const response = await queryModel(inputs);
        
        // Suponiendo que la respuesta es un objeto con la clave 'generated_text'
        const generatedText = response.generated_text || response[0].generated_text;

        res.json({ response: generatedText });
    } catch (error) {
        console.error('Error in chatbotController:', error);
        res.status(500).json({ error: error.message });
    }
};