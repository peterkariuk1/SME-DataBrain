import { config } from 'dotenv';
config();

import '@/ai/flows/answer-business-questions.ts';
import '@/ai/flows/data-transformation-from-document.ts';
import '@/ai/flows/generate-business-health-score.ts';
import '@/ai/flows/generate-monthly-business-summary.ts';