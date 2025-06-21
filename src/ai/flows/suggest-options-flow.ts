'use server';
/**
 * @fileOverview An AI flow to suggest options for a poll question.
 *
 * - suggestOptions - A function that suggests poll options based on a question.
 * - SuggestOptionsInput - The input type for the suggestOptions function.
 * - SuggestOptionsOutput - The return type for the suggestOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestOptionsInputSchema = z.object({
  question: z.string().describe('The poll question to generate options for.'),
});
export type SuggestOptionsInput = z.infer<typeof SuggestOptionsInputSchema>;

const SuggestOptionsOutputSchema = z.object({
  options: z.string().describe('A list of suggested poll options, separated by newlines.'),
});
export type SuggestOptionsOutput = z.infer<typeof SuggestOptionsOutputSchema>;

export async function suggestOptions(input: SuggestOptionsInput): Promise<SuggestOptionsOutput> {
  return suggestOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPollOptionsPrompt',
  input: {schema: SuggestOptionsInputSchema},
  output: {schema: SuggestOptionsOutputSchema},
  prompt: `You are an expert at creating engaging polls. Given the following poll question, please generate four relevant and distinct options.

Question: {{{question}}}

Provide the options as a single block of text, with each option on a new line. Do not include bullet points, numbers, or any other formatting.`,
});

const suggestOptionsFlow = ai.defineFlow(
  {
    name: 'suggestOptionsFlow',
    inputSchema: SuggestOptionsInputSchema,
    outputSchema: SuggestOptionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
