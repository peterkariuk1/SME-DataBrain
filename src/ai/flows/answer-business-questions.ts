'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering business questions using natural language.
 *
 * The flow takes a question and business data as input, and returns an AI-powered insight as output.
 *
 * @file
 * answerBusinessQuestions - A function that answers business questions.
 * AnswerBusinessQuestionsInput - The input type for the answerBusinessQuestions function.
 * AnswerBusinessQuestionsOutput - The output type for the answerBusinessQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerBusinessQuestionsInputSchema = z.object({
  question: z.string().describe('The question about the business performance.'),
  businessData: z.string().describe('The business data to use to answer the question.'),
});

export type AnswerBusinessQuestionsInput = z.infer<
  typeof AnswerBusinessQuestionsInputSchema
>;

const AnswerBusinessQuestionsOutputSchema = z.object({
  answer: z.string().describe('The AI-powered answer to the question.'),
});

export type AnswerBusinessQuestionsOutput = z.infer<
  typeof AnswerBusinessQuestionsOutputSchema
>;

export async function answerBusinessQuestions(
  input: AnswerBusinessQuestionsInput
): Promise<AnswerBusinessQuestionsOutput> {
  return answerBusinessQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerBusinessQuestionsPrompt',
  input: {schema: AnswerBusinessQuestionsInputSchema},
  output: {schema: AnswerBusinessQuestionsOutputSchema},
  prompt: `You are a business analyst. Use the following business data to answer the question.\n\nBusiness Data: {{{businessData}}}\n\nQuestion: {{{question}}}\n\nAnswer: `,
});

const answerBusinessQuestionsFlow = ai.defineFlow(
  {
    name: 'answerBusinessQuestionsFlow',
    inputSchema: AnswerBusinessQuestionsInputSchema,
    outputSchema: AnswerBusinessQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
