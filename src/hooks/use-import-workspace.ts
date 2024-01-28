import { useCallback, useContext } from 'react';
import JSZip from 'jszip';
import { toastifyError, toastifyInfo } from '../components/Toast';
import { ACFile, Knowledge, db } from '../../db';
import { ACDoc } from '../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../context/GlobalStateContext';

export const useImportWorkspace = () => {
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const loadWorkspace = useCallback(
    async (file: File) => {
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
      globalServices.appStateService.send('RESYNC_DB');
      return {
        workspaceId: workspaceData.workspace.id,
        docId: workspaceData.docs[0]?.id,
      };
    },
    [globalServices.appStateService],
  );

  const syncData = useCallback(
    async (updateData: any) => {
      console.log('syncData', updateData);
      const workspaceData = updateData.data;
      // Load all files in the 'files' directory
      // let's update our db tables here for workspace, agents, docs, files, and knowledge
      db.workspaces.put(workspaceData.workspace);
      db.agents.put(workspaceData.agent[0]);
      workspaceData.docs.forEach((doc: ACDoc) => {
        db.docs.put(doc);
      });
      workspaceData.knowledge.forEach((knowledge: Knowledge) => {
        db.knowledge.put(knowledge);
      });
      globalServices.appStateService.send('RESYNC_DB');
      return {
        workspaceId: workspaceData.workspace.id,
        docId: workspaceData.docs[0]?.id,
      };
      // Depending on the structure of updateData, handle its synchronization with local state/db
      // For example, if updateData contains updated documents:
      // if (updateData.docs && Array.isArray(updateData.docs)) {
      //   for (const doc of updateData.docs) {
      //     await db.docs.put(doc); // Assuming a 'put' operation will update or insert as needed
      //   }
      // }
      //   // Handle other entities similarly: agents, knowledge pieces, etc.
      //   // After syncing, you might need to notify the application of the update:
      //   globalServices.appStateService.send('RESYNC_DB');
      //   // Additional UI updates or notifications can be triggered here as well
    },
    [globalServices.appStateService],
  );

  return { loadWorkspace, syncData };
};
