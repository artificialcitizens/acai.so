import { useEffect, useState } from 'react';
import { Workspace, appStateMachine } from '../../machines';
import { useInterpret } from '@xstate/react';
import { v4 as uuidv4 } from 'uuid';

export const WorkspaceManager: React.FC = () => {
  const service = useInterpret(appStateMachine);

  const [selectedWorkspace, setSelectedWorkspace] = useState<string>();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const activeWorkspaceId = service.getSnapshot().context.activeWorkspaceId;

  useEffect(() => {
    const currentContext = service.getSnapshot().context;
    if (currentContext.workspaces) {
      const ws = currentContext.workspaces[currentContext.activeWorkspaceId];
      if (ws) {
        setSelectedWorkspace(ws.id);
      }
    }
  }, [service, activeWorkspaceId]);

  const handleSelectWorkspace = (id: string) => {
    service.send({ type: 'SET_ACTIVE_WORKSPACE', id });
    setSelectedWorkspace(id);
  };

  // const handleUpdateWorkspace = (id: string, updates: Partial<Workspace>) => {
  //   service.send({
  //     type: 'UPDATE_WORKSPACE',
  //     id,
  //     workspace: updates,
  //   });
  // };

  // const handleDeleteWorkspace = (id: string) => {
  //   service.send({
  //     type: 'DELETE_WORKSPACE',
  //     id,
  //   });
  // };

  const handleAddWorkspace = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const id = uuidv4();
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
              id: uuidv4(),
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

    setNewWorkspaceName('');
  };

  if (!service.getSnapshot().context.workspaces) {
    return null;
  }

  return (
    <div>
      <select value={selectedWorkspace} onChange={(e) => handleSelectWorkspace(e.target.value)}>
        {Object.values(service.getSnapshot().context.workspaces).map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      <form onSubmit={handleAddWorkspace}>
        <input
          type="text"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="Workspace name"
          required
        />
        <button type="submit">+</button>
      </form>

      {/* <button onClick={() => handleUpdateWorkspace(selectedWorkspace, { name: 'New Name' })}>Update Workspace</button>

      <button onClick={() => handleDeleteWorkspace(selectedWorkspace)}>Delete Workspace</button> */}
    </div>
  );
};
