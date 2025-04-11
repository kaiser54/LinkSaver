import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || 'YOUR_API_KEY';

if (apiKey === 'YOUR_API_KEY') {
  console.warn(
    'Please set the GOOGLE_GENAI_API_KEY environment variable. ' +
      'You can obtain an API key from https://makersuite.google.com/app/apikey.'
  );
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

