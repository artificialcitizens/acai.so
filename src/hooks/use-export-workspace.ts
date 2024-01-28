import { useCallback, useContext } from 'react';
import { ACFile, Knowledge, db } from '../../db';
import JSZip from 'jszip';
import { ACDoc, AgentWorkspace, Workspace } from '../state';
import SocketContext from '../context/SocketContext';
import { toastifyInfo } from '../components/Toast';

export const useExportWorkspace = () => {
  const socket = useContext(SocketContext);
  // Function to create a sync data object
  const createSyncDataObject = useCallback(
    (
      workspace: Workspace,
      docs: ACDoc[],
      agent: AgentWorkspace[],
      knowledge: Knowledge[],
      files: ACFile[],
    ) => {
      // Include a timestamp or other metadata as needed for synchronization
      const timestamp = new Date().toISOString();
      const syncDataObject = {
        timestamp,
        workspace,
        docs,
        agent,
        knowledge,
        files,
      };
      return syncDataObject;
    },
    [],
  );

  const syncWorkspace = useCallback(
    async (workspaceId: string) => {
      const workspace = await db.workspaces.get(workspaceId);
      if (!workspace) {
        throw new Error(`Workspace ${workspaceId} not found`);
      }
      const docs = await db.docs.where({ workspaceId }).toArray();
      const agent = await db.agents.where({ workspaceId }).toArray();
      const knowledge = await db.knowledge.where({ workspaceId }).toArray();
      const files = await db.files.where({ workspaceId }).toArray();

      const zip = new JSZip();
      const filesFolder = zip.folder('files');
      if (filesFolder) {
        await Promise.all(
          files.map(async (file) => {
            filesFolder.file(file.fileName, file.file);
          }),
        );
      }

      // Use the createSyncDataObject function to prepare the data
      const syncData = createSyncDataObject(
        workspace,
        docs,
        agent,
        knowledge,
        files,
      );
      if (socket) {
        toastifyInfo('Syncing workspace...');
        socket.emit('sync_workspace', {
          id: workspaceId,
          latest_timestamp: syncData.timestamp,
          data: syncData,
        });
      } else {
        throw new Error('Socket not connected');
      }
      // Convert the sync data object to JSON and include it in the ZIP
      // const json = JSON.stringify(syncData, null, 2);
      // zip.file('data.json', json);

      // const content = await zip.generateAsync({ type: 'blob' });
      // const url = URL.createObjectURL(content);

      // // const link = document.createElement('a');
      // // link.href = url;
      // // link.download = `${workspace.name}.zip`;
      // // link.click();

      // // Clean up
      // URL.revokeObjectURL(url);
    },
    [createSyncDataObject, socket],
  );

  return { syncWorkspace };
};
