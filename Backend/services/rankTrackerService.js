import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini SDK
// It automatically authenticates using the GEMINI_API_KEY environment variable
const ai = new GoogleGenAI();

/**
 * Generates a comprehensive AI SEO report based on website audit metrics.
 * @param {Object} websiteMetrics - Scraped data from the browser-based tool
 * @returns {Object} Structured SEO analysis report
 */
export const generateSeoReport = async (websiteMetrics) => {
  try {
    // 1. Construct the system prompt with the scraped technical details
    const prompt = `
      You are an advanced AI SEO Auditor. Analyze the following scraped website metrics and compile a highly structured SEO performance evaluation report.

      Website Audit Data:
      ${JSON.stringify(websiteMetrics)}

      CRITICAL: You must return your analysis strictly as a valid JSON object. 
      Do not wrap the response in markdown code blocks (like \`\`\`json). 
      The JSON object must precisely match the following structure:
      {
        "overallScore": 85,
        "seoScore": 90,
        "performanceScore": 78,
        "accessibilityScore": 88,
        "bestPracticesScore": 82,
        "metaTagsStatus": "good" | "warning" | "critical",
        "issues": [
          {
            "type": "critical" | "warning" | "good",
            "category": "Performance" | "SEO" | "Accessibility",
            "message": "Description of the issue found"
          }
        ],
        "recommendations": [
          "Actionable recommendation 1",
          "Actionable recommendation 2"
        ]
      }
    `;

    // 2. Request content generation from Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', // Fast execution, ideal for processing structured data
      contents: prompt,
      config: {
        // This ensures the model outputs perfectly structured JSON data
        responseMimeType: 'application/json'
      }
    });

    // 3. Parse the clean JSON string returned by the API
    const reportData = JSON.parse(response.text);
    return reportData;

  } catch (error) {
    console.error("Error inside rankTrackerServices generating SEO Report:", error);
    throw new Error("AI analysis service failed to process the request.");
  }
};

/**
 * Optional Helper: Formats keyword rank tracking results
 * Useful if you need Gemini to clean up search results ranking variations
 */
export const analyzeKeywordRanking = async (keyword, domain, competitorsList) => {
  try {
    const prompt = `
      Analyze the search visibility for the keyword "${keyword}" regarding the domain "${domain}".
      Competitors Found: ${JSON.stringify(competitorsList)}
      Provide a 2-sentence tactical snippet on how to outrank these competitors.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing keyword ranking:", error);  
    return "Optimization advice unavailable at this time.";
  }
};