const SYSTEM_PROMPT = `You are a movie recommendation expert. Only recommend feature films (no TV series, no TV shows, no miniseries, no anime series). Provide movie recommendations in ONLY valid JSON format with NO markdown, preamble, or explanation. Return exactly this structure:
{
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2020,
      "genre": "Genre",
      "rating": 8.5,
      "runtime": "120 min",
      "director": "Director Name",
      "plot": "Brief plot description",
      "why": "Why this matches their preferences"
    }
  ]
}

Provide 5-6 diverse recommendations that match the user's preferences. Be specific and helpful.`;

const buildPrompt = (userMessage, conversationHistory) => {
    let messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    conversationHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
    });

    messages.push({ role: 'user', content: userMessage });
    return messages;
};

const parseResponse = (text) => {
    const cleanJson = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    return JSON.parse(cleanJson);
};

exports.getMovieRecommendations = async (userMessage, conversationHistory = []) => {
    try {
        const messages = buildPrompt(userMessage, conversationHistory);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Groq API error: ' + response.status);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        const parsed = parseResponse(assistantMessage);

        const updatedHistory = [
            ...conversationHistory,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantMessage }
        ];

        return {
            recommendations: parsed.recommendations || [],
            conversationHistory: updatedHistory
        };

    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to get recommendations from AI service');
    }
};