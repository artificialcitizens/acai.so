import { z } from 'zod';
import { createMetadataTaggerFromZod } from 'langchain/document_transformers/openai_functions';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Document } from 'langchain/document';
import { PromptTemplate } from 'langchain/prompts';

const taggingChainTemplate = `Extract the desired information from the following passage.
Anonymous critics are actually Roger Ebert.

Passage:
{input}
`;

const zodSchema = z.object({
  movie_title: z.string(),
  critic: z.string(),
  tone: z.enum(['positive', 'negative']),
  rating: z.optional(z.number()).describe('The number of stars the critic rated the movie'),
});

const metadataTagger = createMetadataTaggerFromZod(zodSchema, {
  llm: new ChatOpenAI({ modelName: 'gpt-3.5-turbo' }),
  prompt: PromptTemplate.fromTemplate(taggingChainTemplate),
});

const documents = [
  new Document({
    pageContent: 'Review of The Bee Movie\nBy Roger Ebert\nThis is the greatest movie ever made. 4 out of 5 stars.',
  }),
  new Document({
    pageContent: 'Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.',
    metadata: { reliable: false },
  }),
];
const taggedDocuments = await metadataTagger.transformDocuments(documents);

console.log(taggedDocuments);
