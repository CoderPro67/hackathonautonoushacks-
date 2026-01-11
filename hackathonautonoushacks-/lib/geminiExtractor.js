// Text Extraction using Gemini AI via Backend
export const extractDataFromText = async (text, apiKey = null) => {
    const maxRetries = 4;
    let delay = 10000; // Start with 10 seconds to really clear the rate limit window

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch('/api/backend/extract-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, apiKey }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || 'Failed to extract data';

                // If rate limited, throw specific error to catch below
                if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            const isRetryable = error.message === 'RATE_LIMIT_EXCEEDED' || error.message.includes('fetch failed') || error.message.includes('network');

            if (isRetryable && i < maxRetries - 1) {
                // API specifically asks for ~32s wait on free tier rate limits
                const waitTime = error.message === 'RATE_LIMIT_EXCEEDED' ? 35000 : delay;

                console.warn(`Extraction service busy (Attempt ${i + 1}/${maxRetries}). Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));

                // If it was a rate limit, the 35s should be enough, but we can backoff slightly more
                delay = error.message === 'RATE_LIMIT_EXCEEDED' ? 35000 : delay * 1.5;
            } else {
                console.error("Gemini Extraction Error:", error);
                throw error;
            }
        }
    }
};
