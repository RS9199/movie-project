const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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


exports.getMovieRecommendations = async (userMessage, conversationHistory = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Build conversation context
        let fullPrompt = SYSTEM_PROMPT + '\n\n';

        // Add conversation history
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                fullPrompt += `User: ${msg.content}\n`;
            } else if (msg.role === 'assistant') {
                fullPrompt += `Assistant: ${msg.content}\n`;
            }
        });

        // Add current user message
        fullPrompt += `User: ${userMessage}\nAssistant:`;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const assistantMessage = response.text();

        // Parse JSON response
        const cleanJson = assistantMessage
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanJson);

        // Update conversation history
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
        console.error('Gemini API Error:', error);
        throw new Error('Failed to get recommendations from AI service');
    }
};