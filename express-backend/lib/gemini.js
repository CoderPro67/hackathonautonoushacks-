const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateContent = async (prompt, apiKey) => {
    if (!apiKey && !process.env.GEMINI_API_KEY) {
        throw new Error('API Key missing');
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(keyToUse);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const maxRetries = 3;
    let delay = 5000;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
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
                    console.log(`Rate limit/Network error. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }
            }
            throw error;
        }
    }
};

module.exports = { generateContent };
