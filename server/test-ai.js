import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

try {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('GoogleGenAI initialized successfully');
} catch (error) {
  console.error('Initialization failed:');
  console.error(error);
}
