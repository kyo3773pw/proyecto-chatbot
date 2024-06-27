import axios from 'axios';

export const sendMessage = async (inputs) => {
    try {
        const response = await axios.post('http://localhost:3000/api/chatbot', { inputs });
        return response.data.response;
    } catch (error) {
        console.error('Error:', error);
        return 'Error: Unable to communicate with the chatbot.';
    }
};
