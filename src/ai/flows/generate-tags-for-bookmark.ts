'use server';
/**
 * @fileOverview AI-powered bookmark tag generator.
 *
 * This file defines a Genkit flow that automatically generates relevant tags
 * for a given bookmark using AI. This allows users to easily categorize and
 * search for their bookmarks later.
 *
 * @module ai/flows/generate-tags-for-bookmark
 *
 * @typedef {object} GenerateTagsInput
 * @property {string} url - The URL of the bookmark.
 * @property {string} title - The title of the bookmark.
 * @property {string} description - The description of the bookmark.
 *
 * @typedef {object} GenerateTagsOutput
 * @property {string[]} tags - An array of generated tags for the bookmark.
 *
 * @function generateTagsForBookmark
 * @param {GenerateTagsInput} input - The input object containing bookmark information.
 * @returns {Promise<GenerateTagsOutput>} - A promise that resolves to an object containing the generated tags.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateTagsInputSchema = z.object({
  url: z.string().describe('The URL of the bookmark.'),
  title: z.string().describe('The title of the bookmark.'),
  description: z.string().describe('The description of the bookmark.'),
});

export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of generated tags for the bookmark.'),
});

export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTagsForBookmark(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  return generateTagsForBookmarkFlow(input);
}

const generateTagsPrompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: {
    schema: z.object({
      url: z.string().describe('The URL of the bookmark.'),
      title: z.string().describe('The title of the bookmark.'),
      description: z.string().describe('The description of the bookmark.'),
    }),
  },
  output: {
    schema: z.object({
      tags: z.array(z.string()).describe('An array of generated tags for the bookmark.'),
    }),
  },
  prompt: `You are a tag generation expert. Your job is to generate tags for a bookmark based on its URL, title, and description.\n\nURL: {{{url}}}\nTitle: {{{title}}}\nDescription: {{{description}}}\n\nGenerate 5-10 tags that are relevant to the bookmark. Return the tags as a JSON array of strings.\n`,
});

const generateTagsForBookmarkFlow = ai.defineFlow<
  typeof GenerateTagsInputSchema,
  typeof GenerateTagsOutputSchema
>({
  name: 'generateTagsForBookmarkFlow',
  inputSchema: GenerateTagsInputSchema,
  outputSchema: GenerateTagsOutputSchema,
},
async input => {
  const {output} = await generateTagsPrompt(input);
  return output!;
}
);
