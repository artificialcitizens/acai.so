import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const createDocumentsFromText = async ({
  text,
  chunkSize,
  chunkOverlap,
}: {
  text: string;
  chunkSize: number;
  chunkOverlap: number;
}): Promise<Document<Record<string, any>>[]> => {
  if (!text) return [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const output = await splitter.createDocuments([text]);
  return output;
};

export const splitDocuments = async ({
  docs,
  chunkSize,
  chunkOverlap,
}: {
  docs: Document[];
  chunkSize: number;
  chunkOverlap: number;
}): Promise<Document<Record<string, any>>[]> => {
  if (docs.length === 0) return [];
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const output = await splitter.splitDocuments(docs);

  return output;
};
