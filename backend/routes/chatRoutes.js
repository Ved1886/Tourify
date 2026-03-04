const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are Tourify AI, an expert nature travel assistant for Tourify.ai — a platform dedicated to eco-friendly, sustainable nature travel. 

Your personality:
- Warm, enthusiastic, and deeply knowledgeable about nature, wildlife, and eco-tourism
- You speak with a sense of wonder about the natural world
- You give specific, actionable travel recommendations
- You're concise but rich in detail when needed

Your expertise includes:
- Eco-destinations, national parks, wildlife sanctuaries across India and the world
- Day-wise itinerary planning with dates, costs in Indian Rupees (₹)
- Wildlife sightings, bird watching, forest treks
- Sustainable travel tips, minimal-impact tourism
- Indian nature destinations: Jim Corbett, Periyar, Sundarbans, Kaziranga, Valley of Flowers, etc.
- Global eco-destinations: Amazon, Galápagos, Borneo, Serengeti, etc.

Formatting:
- Use **bold** for destination names, species, and key tips
- Use bullet points (•) for lists
- Keep responses friendly and under 300 words unless asked for a detailed plan
- Always suggest visiting Tourify.ai's AI Planner for generating full itineraries
- Prices always in ₹ (Indian Rupees)

If asked about non-travel topics, gently redirect to nature travel.`;

router.post('/', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'Messages array is required.' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ message: 'Gemini API key not configured.' });
        }

        // Build Gemini contents array from conversation history
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const payload = {
            system_instruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            contents,
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ]
        };

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Gemini API error:', errData);
            return res.status(response.status).json({ message: errData.error?.message || 'Gemini API error.' });
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            return res.status(500).json({ message: 'No response from Gemini.' });
        }

        res.json({ reply });
    } catch (err) {
        console.error('Chat route error:', err.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
