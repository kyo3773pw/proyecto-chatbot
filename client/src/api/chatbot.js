import axios from 'axios';

export const sendMessage = async (message) => {
    try {
        const response = await axios.post('http://localhost:3000/api/chatbot', {
            query: message,
            type: 'event'  // Asegúrate de reemplazar esto con el tipo adecuado
        });
        return response.data.response;
    } catch (error) {
        console.error('Error:', error);
        return 'Error: Unable to communicate with the chatbot.';
    }
};
