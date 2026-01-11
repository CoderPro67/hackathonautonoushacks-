export const verifyBRSRData = async (formData, extractedData, apiKey = null) => {
  const maxRetries = 4;
  let delay = 10000; // Start with 10s

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Direct call to proxy which forwards to Express backend
      const response = await fetch('/api/backend/audit-and-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData, extractedData, userApiKey: apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Audit service unavailable';

        // Retry on rate limits or server/gateway errors (5xx)
        if (response.status === 429 || response.status >= 500 ||
          errorMessage.includes('429') || errorMessage.includes('Quota') || errorMessage.includes('fetch failed')) {
          throw new Error('RETRY_ERROR');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // Also retry on network level errors (like "fetch failed")
      const isRetryable = error.message === 'RETRY_ERROR' || error.message.includes('fetch failed') || error.message.includes('network');

      if (isRetryable && i < maxRetries - 1) {
        console.warn(`CA Service busy (Attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      } else {
        console.error("CA Verification Error:", error);
        throw error;
      }
    }
  }
};
