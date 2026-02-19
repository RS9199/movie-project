import { useState } from 'react';

function ChatInput({ onSendMessage, isLoading }) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = message.trim();
        if (!trimmed || isLoading) return;

        onSendMessage(trimmed);
        setMessage('');
    };

    return (
        <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
                type="text"
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me what kind of movies you like..."
                disabled={isLoading}
            />
            <button
                type="submit"
                className="send-button"
                disabled={isLoading || !message.trim()}
            >
                {isLoading ? 'Searching...' : 'Get Recommendations'}
            </button>
        </form>
    );
}

export default ChatInput;