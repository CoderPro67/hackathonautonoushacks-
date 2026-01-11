const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateContent = async (prompt, apiKey) => {
    if (!apiKey && !process.env.GEMINI_API_KEY) {
        throw new Error('API Key missing');
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(keyToUse);
    // Fallback to 1.5-flash if 2.5 is causing issues or not available
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const maxRetries = 5;
    let delay = 10000;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                // Removed generationConfig.responseMimeType to be compatible with older SDKs
            });

            let responseText = result.response.text();

            // Clean markdown code blocks if present
            if (responseText.includes('```json')) {
                responseText = responseText.replace(/```json/g, '').replace(/```/g, '');
            } else if (responseText.includes('```')) {
                responseText = responseText.replace(/```/g, '');
            }

            return JSON.parse(responseText);

        } catch (error) {
            if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('fetch failed')) {
                if (i < maxRetries - 1) {
                    // Extract suggested wait time if available in error message (simple heuristic)
                    console.log(`Rate limit/Network error. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff: 10s -> 20s -> 40s -> 80s -> 160s
                    continue;
                }
            }
            throw error;
        }
    }
};

module.exports = { generateContent };
