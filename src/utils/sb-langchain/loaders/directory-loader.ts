import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { EPubLoader } from "langchain/document_loaders/fs/epub";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { SRTLoader } from "langchain/document_loaders/fs/srt";

export const directoryLoader = async (path: string) => {
  const loader = new DirectoryLoader(path, {
    ".json": (path) => new JSONLoader(path),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".epub": (path) => new EPubLoader(path),
    ".pdf": (path) => new PDFLoader(path),
    ".srt": (path) => new SRTLoader(path),
  });
  const docs = await loader.load();
  console.log({ docs });
  return docs;
};
