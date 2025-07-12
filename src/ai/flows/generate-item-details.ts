
'use server';
/**
 * @fileOverview An AI flow to generate item details from an image.
 *
 * - generateItemDetails - A function that handles the item detail generation process.
 * - GenerateItemDetailsInput - The input type for the generateItemDetails function.
 * - GenerateItemDetailsOutput - The return type for the generateItemDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateItemDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateItemDetailsInput = z.infer<typeof GenerateItemDetailsInputSchema>;

const GenerateItemDetailsOutputSchema = z.object({
  title: z.string().describe('A concise, attractive title for the clothing item.'),
  description: z.string().describe('A detailed and compelling description of the item, highlighting its features.'),
  category: z.enum(['Tops', 'Dresses', 'Pants', 'Jackets', 'Accessories']).describe('The category of the clothing item.'),
  type: z.enum(['Casual', 'Formal', 'Sport']).describe('The style type of the clothing item.'),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']).describe('The estimated size of the clothing item.'),
  condition: z.enum(['New', 'Gently Used', 'Used']).describe('The estimated condition of the item.'),
  tags: z.array(z.string()).describe('An array of 2-4 relevant tags for the item.'),
});
export type GenerateItemDetailsOutput = z.infer<typeof GenerateItemDetailsOutputSchema>;

export async function generateItemDetails(input: GenerateItemDetailsInput): Promise<GenerateItemDetailsOutput> {
  return generateItemDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItemDetailsPrompt',
  input: { schema: GenerateItemDetailsInputSchema },
  output: { schema: GenerateItemDetailsOutputSchema },
  prompt: `You are an expert in fashion and clothing. Analyze the provided image of a clothing item and generate the required details.

Your response must be in the structured JSON format requested.

Analyze the image and provide a suitable title, a detailed description, and select the most appropriate category, type, size, and condition from the available options. Also, provide a few relevant tags.

Photo: {{media url=photoDataUri}}`,
});

const generateItemDetailsFlow = ai.defineFlow(
  {
    name: 'generateItemDetailsFlow',
    inputSchema: GenerateItemDetailsInputSchema,
    outputSchema: GenerateItemDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a response.");
    }
    return output;
  }
);

    