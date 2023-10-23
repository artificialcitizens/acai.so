import { ACDoc } from '../state';

const fetchDocs = async (): Promise<
  { filename: string; content: string }[]
> => {
  const markdownFiles = [
    'introduction.md',
    'knowledge.md',
    'voice-synthesis.md',
  ]; // replace with your actual file names
  const docs = [];

  for (const file of markdownFiles) {
    try {
      const response = await fetch(`/docs/${file}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      docs.push({ filename: file, content: text });
    } catch (err) {
      console.error(`Error fetching ${file}: ${err}`);
    }
  }

  return docs;
};

export const createAcaiDocumentation = async () => {
  const response = await fetchDocs();
  const docs = response
    .map((doc: any) => {
      const title = doc.filename.replace('.md', '');
      const tab: ACDoc = {
        id: title.toLowerCase().replace(/ /g, '-'),
        title: title,
        filetype: 'markdown',
        content: doc.content,
        isContext: false,
        autoSave: false,
        systemNote: '',
        canEdit: import.meta.env.DEV,
        workspaceId: 'docs',
        createdAt: doc.createdAt,
        lastUpdated: doc.createdAt,
      };
      return tab;
    })
    .sort((a: ACDoc, b: ACDoc) => {
      if (a.title < b.title) {
        return -1;
      }
      return 1;
    });

  return docs;
};
