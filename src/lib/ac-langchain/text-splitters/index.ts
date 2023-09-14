import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const createDocumentsFromText = async ({
  text,
  chunkSize,
  chunkOverlap,
  /**
   * Optional heading to be added to each chunk
    // https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/contextual_chunk_headers
   * @example `DOCUMENT NAME: Jim Interview\n\n---\n\n`
   */
  chunkHeader,
  metadata,
}: {
  text: string;
  chunkSize: number;
  chunkOverlap: number;
  chunkHeader?: string;
  metadata?: Record<string, any>[];
}): Promise<Document<Record<string, any>>[]> => {
  if (!text) return [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const output = await splitter.createDocuments([text], metadata, {
    chunkHeader,
    appendChunkOverlapHeader: true,
  });
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
