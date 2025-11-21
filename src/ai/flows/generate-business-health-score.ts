'use server';
/**
 * @fileOverview Generates a business health score based on uploaded data, highlighting strengths and weaknesses.
 *
 * - generateBusinessHealthScore - A function that generates the business health score.
 * - BusinessHealthScoreInput - The input type for the generateBusinessHealthScore function.
 * - BusinessHealthScoreOutput - The return type for the generateBusinessHealthScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BusinessHealthScoreInputSchema = z.object({
  financialData: z
    .string()
    .describe("Financial data of the business, including revenue, expenses, and assets."),
  operationalData: z
    .string()
    .describe("Operational data of the business, including sales, inventory, and customer data."),
  marketData: z
    .string()
    .describe("Market data relevant to the business, including competitor information and market trends."),
});
export type BusinessHealthScoreInput = z.infer<typeof BusinessHealthScoreInputSchema>;

const BusinessHealthScoreOutputSchema = z.object({
  score: z.number().describe("Overall business health score, ranging from 0 to 100."),
  strengths: z.array(z.string()).describe("Key strengths of the business."),
  weaknesses: z.array(z.string()).describe("Key weaknesses of the business."),
  recommendations: z.array(z.string()).describe("Recommendations for improving business health."),
});
export type BusinessHealthScoreOutput = z.infer<typeof BusinessHealthScoreOutputSchema>;

export async function generateBusinessHealthScore(input: BusinessHealthScoreInput): Promise<BusinessHealthScoreOutput> {
  return generateBusinessHealthScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessHealthScorePrompt',
  input: {schema: BusinessHealthScoreInputSchema},
  output: {schema: BusinessHealthScoreOutputSchema},
  prompt: `You are an AI assistant designed to analyze business data and generate a business health score.

  Analyze the provided financial, operational, and market data to generate a comprehensive business health score, identify key strengths and weaknesses, and provide actionable recommendations.

  Financial Data: {{{financialData}}}
  Operational Data: {{{operationalData}}}
  Market Data: {{{marketData}}}

  Based on the data above, generate a business health score (0-100), list the business\'s key strengths and weaknesses, and provide recommendations for improvement. Output the information in JSON format.

  Ensure that the score, strengths, weaknesses, and recommendations are clear, concise, and easily understandable.
  `,
});

const generateBusinessHealthScoreFlow = ai.defineFlow(
  {
    name: 'generateBusinessHealthScoreFlow',
    inputSchema: BusinessHealthScoreInputSchema,
    outputSchema: BusinessHealthScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
