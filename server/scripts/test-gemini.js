import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const testGemini = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 Testing Gemini API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');

  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in .env');
    return;
  }

  const modelName = 'gemini-2.5-flash';
  console.log(`\n📡 Sending test prompt using model: ${modelName}...`);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Hello! Tell me in one word if you can hear me.');
    const response = await result.response;
    console.log(`🟢 Success [${modelName}]:`, response.text().trim());
  } catch (error) {
    console.error(`❌ Failed [${modelName}] with error:`);
    console.error(error.message || error);
  }
};

testGemini();
