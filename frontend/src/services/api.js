const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3001/api`;
let sessionId = null;

export const getRecommendations = async (message) => {
    try {
        const response = await fetch(API_URL + '/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get recommendations');
        }

        const data = await response.json();
        sessionId = data.sessionId;
        return data;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const clearHistory = async () => {
    try {
        const response = await fetch(API_URL + '/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to clear history');
        }

        sessionId = null;
        return await response.json();

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const checkHealth = async () => {
    try {
        const response = await fetch(API_URL + '/health');
        return await response.json();

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};