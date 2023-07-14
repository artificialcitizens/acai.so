import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 10,
  chunkOverlap: 1,
});
export const loadTextFile = async (rawText: string, metaData) => {
  const docOutput = await splitter.splitDocuments([
    new Document({ pageContent: rawText }),
  ]);
};
