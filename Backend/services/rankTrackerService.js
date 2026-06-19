const { GoogleGenAI } = require('@google/genai');

// Yahan apni copied API key dalo
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateSEOHints() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Mujhay is website ke liye ek achi meta description likh kar do: "E-commerce store for sports shoes in Pakistan".',
        });

        // Yeh tumhara generated text response hai
        console.log(response.text); 
    } catch (error) {
        console.error("API Error:", error);
    }
}

generateSEOHints();