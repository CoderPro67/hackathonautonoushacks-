const { generateContent } = require('../lib/gemini');

exports.extractData = async (req, res) => {
    const { text, apiKey: userApiKey } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    try {
        const prompt = `
      You are an expert financial analyst. Analyze the following annual report text and extract BRSR data.
      
      Task 1: Extract Table 14 - details of business activities accounting for 90% of turnover.
      Task 2: Extract Table 15 - products/services selling 90% of turnover.

      The input text is from a PDF/Excel. Explicitly look for "Business Activities", "NIC Code", "Turnover", "Product/Service".

      Return a JSON object with this EXACT structure:
      {
        "table14": [
          { "mainActivity": "string", "description": "string", "turnoverPercentage": "number (0-100)" }
        ],
        "table15": [
          { "productService": "string", "nicCode": "string", "turnoverPercentage": "number (0-100)" }
        ]
      }
      
      If data is missing, return empty arrays. Convert percentages to numbers.

      Input Text:
      ${text.substring(0, 30000)} 
      (Truncated if too long, prioritized first 30k chars which usually contain the tables in Section A or beginning of report)
    `;

        const result = await generateContent(prompt, userApiKey);

        // The generateContent lib function typically returns the parsed JSON if it's set up that way,
        // or we might need to handle parsing. Looking at auditController, it seems to return result directly.
        // Let's verify lib/gemini.js layout to be sure in next step, but this assumes it handles generation.

        res.json(result);

    } catch (error) {
        console.error("Extraction Error:", error);
        res.status(500).json({ error: error.message || 'Failed to process document with AI' });
    }
};
