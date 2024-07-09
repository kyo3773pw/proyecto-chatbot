import Event from '../models/event.model.js';
import { queryModel } from '../libs/huggingFaceAPI.js';

export const getResponse = async (req, res) => {
    try {
        const { query, type } = req.body;

        if (!query || !type) {
            return res.status(400).send('Bad Request: query and type are required');
        }

        console.log(`Received query: ${query}, type: ${type}`);

        // Recuperar documentos relevantes de la base de datos
        const events = await Event.find({ type });

        console.log(`Found ${events.length} events of type ${type}`);

        if (events.length === 0) {
            return res.status(404).send('No events found');
        }

        // Formatear la información recuperada para el modelo de generación
        const context = events.map(event => `${event.nombre}: ${event.url_registro}`).join('\n');

        console.log(`Context for the model: ${context}`);

        // Generar una respuesta usando el modelo
        const response = await queryModel(`${context}\n\n${query}`);

        if (response && response.generated_text) {
            console.log(`Generated response: ${response.generated_text}`);
            res.json({ response: response.generated_text });
        } else {
            console.error('Invalid response from model');
            res.status(500).send('Server error: Invalid response from model');
        }
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).send('Server error');
    }
};
