'use server';

/**
 * @fileOverview Generates a monthly summary of business performance.
 * The summary includes key trends, anomalies, and actionable insights, with optional comparison to the previous month.
 *
 * @file
 * generateMonthlyBusinessSummary - A function that generates the monthly summary.
 * GenerateMonthlyBusinessSummaryInput - The input type for the generateMonthlyBusinessSummary function.
 * GenerateMonthlyBusinessSummaryOutput - The return type for the generateMonthlyBusinessSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyBusinessSummaryInputSchema = z.object({
  businessData: z.string().describe('Monthly business data in JSON format, including revenue, expenses, and other relevant metrics.'),
  previousSummary: z.string().optional().describe('The previous month summary, if available, to compare performance.'),
});
export type GenerateMonthlyBusinessSummaryInput = z.infer<typeof GenerateMonthlyBusinessSummaryInputSchema>;

const GenerateMonthlyBusinessSummaryOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the monthly business performance, including trends, anomalies, and key insights.'),
});
export type GenerateMonthlyBusinessSummaryOutput = z.infer<typeof GenerateMonthlyBusinessSummaryOutputSchema>;

export async function generateMonthlyBusinessSummary(input: GenerateMonthlyBusinessSummaryInput): Promise<GenerateMonthlyBusinessSummaryOutput> {
  return generateMonthlyBusinessSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyBusinessSummaryPrompt',
  input: {schema: GenerateMonthlyBusinessSummaryInputSchema},
  output: {schema: GenerateMonthlyBusinessSummaryOutputSchema},
  prompt: `You are an AI assistant specializing in business performance analysis. Generate a comprehensive monthly summary of the business based on the provided data.\n\nData: {{{businessData}}}\n\nInclude the following in the summary:\n- Key trends in revenue, expenses, and other metrics.\n- Any anomalies or significant deviations from expected performance.\n- Key insights and recommendations for improvement.\n- Comparison to previous month\'s performance, if available.  Previous summary: {{{previousSummary}}}\n`,
});

const generateMonthlyBusinessSummaryFlow = ai.defineFlow(
  {
    name: 'generateMonthlyBusinessSummaryFlow',
    inputSchema: GenerateMonthlyBusinessSummaryInputSchema,
    outputSchema: GenerateMonthlyBusinessSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
