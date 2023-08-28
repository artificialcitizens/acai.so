import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// const supportedLanguages: (typeof SupportedTextSplitterLanguages)[] = [
type CodeSplitterLang =
  | 'cpp'
  | 'go'
  | 'java'
  | 'js'
  | 'php'
  | 'proto'
  | 'python'
  | 'rst'
  | 'ruby'
  | 'rust'
  | 'scala'
  | 'swift'
  | 'markdown'
  | 'latex'
  | 'html';

export const splitText = async (text: string, lang: CodeSplitterLang) => {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage(lang, {
    chunkSize: 100,
    chunkOverlap: 0,
  });

  const docs = await splitter.createDocuments([text]);

  return docs;
};
