'use server';
/**
 * @fileOverview This file defines a Genkit flow for transforming data from documents and images into a structured format.
 *
 * The flow takes a document or image as input and uses AI to extract and transform the data into a structured format suitable for analysis.
 *
 * @interface DataTransformationFromDocumentInput - Defines the input schema for the data transformation flow.
 * @interface DataTransformationFromDocumentOutput - Defines the output schema for the data transformation flow.
 * @function dataTransformationFromDocument - The main function that triggers the data transformation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataTransformationFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'The document or image data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Per guidance, it should be passed as a data uri
    ),
});

export type DataTransformationFromDocumentInput = z.infer<
  typeof DataTransformationFromDocumentInputSchema
>;

const DataTransformationFromDocumentOutputSchema = z.object({
  structuredData: z
    .string()
    .describe(
      'The structured data extracted from the document, in JSON format.'
    ),
});

export type DataTransformationFromDocumentOutput = z.infer<
  typeof DataTransformationFromDocumentOutputSchema
>;

export async function dataTransformationFromDocument(
  input: DataTransformationFromDocumentInput
): Promise<DataTransformationFromDocumentOutput> {
  return dataTransformationFromDocumentFlow(input);
}

const dataTransformationFromDocumentPrompt = ai.definePrompt({
  name: 'dataTransformationFromDocumentPrompt',
  input: {schema: DataTransformationFromDocumentInputSchema},
  output: {schema: DataTransformationFromDocumentOutputSchema},
  prompt: `You are an expert data extraction specialist and tool selector.

  Your task is to extract data from the provided document and convert it into a structured JSON format. To do this, you must first select the best tool for extracting data from this document, then use that tool to extract the data.
  Identify all key-value pairs and relevant information within the document.
  Pay special attention to handwritten notes and unstructured formats, using AI to interpret them accurately.

  Return the extracted data in a JSON format.

  Document: {{media url=documentDataUri}}`,
});

const dataTransformationFromDocumentFlow = ai.defineFlow(
  {
    name: 'dataTransformationFromDocumentFlow',
    inputSchema: DataTransformationFromDocumentInputSchema,
    outputSchema: DataTransformationFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await dataTransformationFromDocumentPrompt(input);
    return output!;
  }
);
