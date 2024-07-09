import React, { useState } from 'react';
import { sendMessage } from '../api/chatbot';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isGreeting, setIsGreeting] = useState(true);

    const handleSendMessage = async (event) => {
        if (event.key === 'Enter' && input.trim()) {
            const newMessage = { sender: 'user', text: input };
            setMessages([...messages, newMessage]);

            let botResponse;
            if (isGreeting) {
                botResponse = "Hola! ¿En qué puedo ayudarte hoy? Puedes preguntar sobre congresos, becas, cursos, etc.";
                setIsGreeting(false);  // Cambiar estado después de saludo inicial
            } else {
                const type = input.toLowerCase().includes('congreso') ? 'congresos' : 
                             input.toLowerCase().includes('beca') ? 'becas' : 
                             input.toLowerCase().includes('curso') ? 'cursos' : 'event';

                botResponse = await sendMessage(input, type);
            }

            setMessages([...messages, newMessage, { sender: 'bot', text: botResponse }]);
            setInput('');
        }
    };

    return (
        <div className="chatbot-container">
            <h1 className="chatbot-title">Ask annie</h1>
            <div className="chat-window">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        <span className="message-sender">{message.sender === 'user' ? '📷' : '🤖'}</span>
                        <span className="message-text">{message.text}</span>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                     type="text"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyPress={handleSendMessage}
                     placeholder="Type your message here"
                />
                <button onClick={handleSendMessage}>➤</button>
            </div>
        </div>
    );
};

export default Chatbot;
