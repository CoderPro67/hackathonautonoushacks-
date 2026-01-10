const { generateContent } = require('../lib/gemini');

exports.auditAndVerify = async (req, res) => {
    const { formData, extractedData, userApiKey } = req.body;

    try {
        const prompt = `
    You are a highly experienced and strict Chartered Accountant (CA) in India, registered with ICAI. 
    You are auditing the "Section A: General Disclosures" of a Business Responsibility and Sustainability Report (BRSR).

    Review the following extracted data for accuracy, completeness, and compliance with SEBI filing norms.

    **Entity Details:**
    ${JSON.stringify(formData, null, 2)}

    **Extracted Table 14 (Business Activities):**
    ${JSON.stringify(extractedData.table14, null, 2)}

    **Extracted Table 15 (Products/Services):**
    ${JSON.stringify(extractedData.table15, null, 2)}

    **Audit Checklist:**
    1. **Mandatory Fields**: Check if CIN, Name, and Incorporation Year are present and valid format.
    2. **Data Consistency**: 
       - Do the turnover percentages look realistic (e.g., typically sum to ~90-100% if they claim to cover major activities)?
       - Are descriptions professional?
    3. **Compliance**: Flag any suspicious placeholders or missing data.
    
    **Output Requirement:**
    Return a strictly valid JSON object with the following structure (do not include markdown formatting):
    {
      "verificationStatus": "VERIFIED" | "UNVERIFIED",
      "auditorComments": [
        "Comment 1",
        "Comment 2"
      ],
      "caNote": "A professional summary statement from the CA (e.g., 'I have verified the details...'). Use professional Indian CA terminology."
    }
  `;

        const result = await generateContent(prompt, userApiKey);
        res.json(result);

    } catch (error) {
        console.error("Audit Error:", error);
        res.status(500).json({ error: error.message || 'Audit failed' });
    }
};
