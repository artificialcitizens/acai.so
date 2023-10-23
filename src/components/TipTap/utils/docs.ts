import axios from 'axios';
import { ACDoc } from '../../../state';

export const fetchDocs = async (): Promise<any> => {
  const ACAI_SERVER =
    import.meta.env.VITE_ACAI_SERVER || process.env.VITE_ACAI_SERVER;
  try {
    const response = await axios.get(`${ACAI_SERVER}/api/docs/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return error;
  }
};

export const createDocs = async () => {
  const response = await fetchDocs();
  if (!response.docs) return [];
  const docs = response.docs
    .map((doc: any) => {
      const tab: ACDoc = {
        id: doc.title.toLowerCase().replace(/ /g, '-'),
        title: doc.title,
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
