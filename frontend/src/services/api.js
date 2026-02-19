const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3001/api`;

let sessionId = null;

function getToken() {
    return localStorage.getItem('token');
}

function createPostOptions(data) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }

    return options;
}

function createGetOptions() {
    const options = {
        method: 'GET',
        headers: {}
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }

    return options;
}

export const register = async (name, email, password) => {
    try {
        const response = await fetch(
            API_URL + '/auth/register',
            createPostOptions({ name, email, password })
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(
            API_URL + '/auth/login',
            createPostOptions({ email, password })
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    sessionId = null;
};

export const getMe = async () => {
    try {
        const response = await fetch(
            API_URL + '/auth/me',
            createGetOptions()
        );

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
            }
            throw new Error('Not authenticated');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
};

export const getRecommendations = async (message) => {
    try {
        const response = await fetch(
            API_URL + '/recommend',
            createPostOptions({ message: message, sessionId: sessionId })
        );

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
        const response = await fetch(
            API_URL + '/clear',
            createPostOptions({ sessionId: sessionId })
        );

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