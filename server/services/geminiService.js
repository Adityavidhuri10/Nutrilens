import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';

/**
 * Fallback result returned when AI analysis cannot be performed.
 * Ensures meal creation always succeeds regardless of AI availability.
 */
const FALLBACK_RESULT = {
  foodItems: [],
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  analysisStatus: 'failed',
};

/**
 * The structured prompt sent to Gemini Vision.
 * Instructs the model to return ONLY valid JSON matching the expected schema.
 */
const ANALYSIS_PROMPT = `You are a professional nutritionist AI. Analyze the food image provided and return a JSON object with the following structure. Do NOT include any text outside the JSON. Do NOT wrap the response in markdown code blocks.

{
  "foodItems": ["item1", "item2"],
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0,
  "fiber": 0
}

Rules:
1. "foodItems" — array of identified food item names (e.g., ["Grilled Chicken Breast", "Steamed Rice", "Mixed Vegetables"])
2. "calories" — estimated total calories (kcal) for the entire visible portion
3. "protein" — estimated total protein in grams
4. "carbs" — estimated total carbohydrates in grams
5. "fats" — estimated total fats in grams
6. "fiber" — estimated total dietary fiber in grams
7. All numeric values should be rounded to the nearest whole number
8. If you cannot identify any food in the image, return foodItems as an empty array and all numeric values as 0
9. Base estimates on typical serving sizes visible in the image
10. Return ONLY the raw JSON object, no explanation, no markdown formatting`;

/**
 * Analyzes a food image using Google Gemini Vision API.
 *
 * @param {Buffer} imageBuffer - The raw image file buffer from multer
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/jpeg')
 * @returns {Promise<{foodItems: string[], calories: number, protein: number, carbs: number, fats: number, fiber: number, analysisStatus: string}>}
 */
export const analyzeFoodImage = async (imageBuffer, mimeType) => {
  // Guard: missing API key
  if (!env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY is not configured. Skipping food analysis.');
    return { ...FALLBACK_RESULT };
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Convert image buffer to base64 for Gemini inline data format
    const base64Image = imageBuffer.toString('base64');

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    // Send the image and prompt to Gemini
    const result = await model.generateContent([ANALYSIS_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = parseGeminiResponse(text);

    return {
      foodItems: parsed.foodItems || [],
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      fats: Math.round(Number(parsed.fats) || 0),
      fiber: Math.round(Number(parsed.fiber) || 0),
      analysisStatus: parsed.foodItems?.length > 0 ? 'success' : 'partial',
    };
  } catch (error) {
    console.error('❌ Gemini food analysis failed:', error.message || error);
    return { ...FALLBACK_RESULT };
  }
};

/**
 * Attempts to parse the raw text response from Gemini into a valid JSON object.
 * Handles cases where Gemini wraps JSON in markdown code blocks.
 *
 * @param {string} text - The raw text response from Gemini
 * @returns {object} - The parsed JSON object
 */
const parseGeminiResponse = (text) => {
  try {
    // Try direct JSON parse first
    return JSON.parse(text);
  } catch {
    // Gemini sometimes wraps response in ```json ... ``` code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        console.error('❌ Failed to parse Gemini JSON from code block:', text.substring(0, 200));
        return {};
      }
    }

    // Last resort: try to find a JSON-like object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        console.error('❌ Failed to parse extracted JSON object:', text.substring(0, 200));
        return {};
      }
    }

    console.error('❌ No JSON found in Gemini response:', text.substring(0, 200));
    return {};
  }
};

export default {
  analyzeFoodImage,
};
