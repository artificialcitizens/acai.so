import { ACDoc } from '../state';

const fetchDocs = async (): Promise<
  { filename: string; content: string }[]
> => {
  const markdownFiles = [
    'introduction.md',
    'knowledge.md',
    'voice-synthesis.md',
  ];
  const docs = [];

  for (const file of markdownFiles) {
    try {
      const response = await fetch(`/docs/${file}`);
      if (!response.ok) {
        throw new Error(`You really did it now! status: ${response.status}`);
      }
      const text = await response.text();
      docs.push({ filename: file, content: text });
    } catch (err) {
      console.error(`Error fetching ${file}: ${err}`);
    }
  }

  return docs;
};

const formatTitle = (title: string) => {
  return title
    .replace('.md', '')
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const createAcaiDocumentation = async () => {
  const response = await fetchDocs();
  const docs = response
    .map((doc: any) => {
      const title = formatTitle(doc.filename);
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
