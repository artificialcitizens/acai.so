import { useCallback } from 'react';
import { db } from '../../db';
import JSZip from 'jszip';

export const useSaveWorkspace = () => {
  const saveWorkspace = useCallback(async (workspaceId: string) => {
    const workspace = await db.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }
    const docs = await db.docs.where({ workspaceId: workspaceId }).toArray();
    const agent = await db.agents.where({ workspaceId: workspaceId }).toArray();
    const knowledge = await db.knowledge
      .where({ workspaceId: workspaceId })
      .toArray();
    const files = await db.files.where({ workspaceId: workspaceId }).toArray();

    const zip = new JSZip();
    const filesFolder = zip.folder('files');

    if (filesFolder) {
      await Promise.all(
        files.map(async (f) => {
          const file = new File([f.file], 'filename');
          const url = URL.createObjectURL(file);
          filesFolder.file(f.fileName, url);
          URL.revokeObjectURL(url);
        }),
      );
    }

    const data = {
      workspace,
      docs,
      agent,
      knowledge,
      files,
    };

    const json = JSON.stringify(data, null, 2);
    zip.file('data.json', json);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${workspace.name}.zip`;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  }, []);

  return { saveWorkspace };
};
