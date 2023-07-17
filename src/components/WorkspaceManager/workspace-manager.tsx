import { useEffect, useState } from 'react';
import { Workspace, appStateMachine } from '../../machines';
import { useInterpret, useSelector } from '@xstate/react';
import { v4 as uuidv4 } from 'uuid';

const selectWorkspace = (state) => state.context.workspaces;
const selectActiveWorkspaceId = (state) => state.context.activeWorkspaceId;

export const WorkspaceManager: React.FC = () => {
  const service = useInterpret(appStateMachine);

  const workspaces = useSelector(service, selectWorkspace);
  const activeWorkspaceId = useSelector(service, selectActiveWorkspaceId);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  useEffect(() => {
    if (workspaces) {
      const ws = workspaces[activeWorkspaceId];
      if (ws) {
        service.send({ type: 'SET_ACTIVE_WORKSPACE', workspaceId: ws.id });
      }
    }
  }, [service, workspaces, activeWorkspaceId]);

  const handleSelectWorkspace = (id: string) => {
    service.send({ type: 'SET_ACTIVE_WORKSPACE', workspaceId: id });
  };

  const handleAddWorkspace = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const id = uuidv4().split('-')[0];
    const newWorkspace: Workspace = {
      id,
      name: newWorkspaceName,
      createdAt: new Date().toString(),
      lastUpdated: new Date().toString(),
      private: true,
      settings: {
        webSpeechRecognition: true,
        tts: false,
        whisper: false,
      },
      data: {
        tiptap: {
          tabs: [
            {
              id: uuidv4().split('-')[0],
              title: 'Hello',
              content: 'Welcome to the new workspace!',
              systemNote: '',

              createdAt: new Date().toString(),
              lastUpdated: new Date().toString(),
              workspaceId: id,
              filetype: 'markdown',
              isContext: false,
            },
          ],
        },
        chat: {},
        agentLogs: {
          thoughts: {},
          errors: {},
        },
        agentTools: {
          calculator: true,
          weather: true,
          googleSearch: true,
          webBrowser: true,
          createDocument: true,
        },
        notes: '',
      },
    };

    service.send({
      type: 'ADD_WORKSPACE',
      workspace: newWorkspace,
    });
  };

  if (!workspaces) {
    return null;
  }

  return (
    <div className="flex justify-between items-center">
      <select
        className="p-[0.125rem]"
        value={selectedWorkspace}
        onChange={(e) => handleSelectWorkspace(e.target.value)}
      >
        {Object.values(service.getSnapshot().context.workspaces).map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      <form onSubmit={handleAddWorkspace} className="ml-4">
        <input
          className="px-[0.25rem]"
          type="text"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="New Workspace Name"
          required
        />
        <button className="px-2" type="submit">
          +
        </button>
      </form>

      {/* <button onClick={() => handleUpdateWorkspace(selectedWorkspace, { name: 'New Name' })}>Update Workspace</button>

      <button onClick={() => handleDeleteWorkspace(selectedWorkspace)}>Delete Workspace</button> */}
    </div>
  );
};
