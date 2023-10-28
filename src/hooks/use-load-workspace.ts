import { useCallback } from 'react';
import JSZip from 'jszip';
import { toastifyError, toastifyInfo } from '../components/Toast';
import { ACFile, Knowledge, db } from '../../db';
import { ACDoc } from '../state';

export const useLoadWorkspace = () => {
  const loadWorkspace = useCallback(async (file: File) => {
    toastifyInfo('Loading workspace...');
    const zip = new JSZip();
    const data = await zip.loadAsync(file);
    const filesFolder = data.folder('files');

    if (!filesFolder) {
      throw new Error('Invalid workspace file. No files directory found.');
    }

    const dataFile = data.file('data.json');
    if (!dataFile) {
      throw new Error('Invalid workspace file. No data.json file found.');
    }
    const jsonData = await dataFile.async('string');
    const workspaceData = JSON.parse(jsonData);
    // Load all files in the 'files' directory
    const files = filesFolder.file(/.*/);
    // let's update our db tables here for workspace, agents, docs, files, and knowledge
    db.workspaces.put(workspaceData.workspace);
    db.agents.put(workspaceData.agent[0]);
    workspaceData.docs.forEach((doc: ACDoc) => {
      db.docs.put(doc);
    });
    workspaceData.knowledge.forEach((knowledge: Knowledge) => {
      db.knowledge.put(knowledge);
    });
    await Promise.all(
      workspaceData.files.map(async (file: ACFile) => {
        const zippedFile = files.find(
          (f: any) => f.name.replace('files/', '') === file.fileName,
        );
        if (!zippedFile) {
          toastifyError(`File ${file.fileName} not found in zip file.`);
          throw new Error(`File ${file.fileName} not found in zip file.`);
        }
        const blob = await zippedFile.async('blob');
        const fileObj = new File([blob], file.fileName, {
          type: file.fileType,
          lastModified: Date.now(),
        });
        await db.files.add({
          id: file.id,
          workspaceId: workspaceData.workspace.id,
          file: fileObj,
          fileType: file.fileType,
          fileName: file.fileName,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        });
      }),
    );
  }, []);

  return { loadWorkspace };
};
