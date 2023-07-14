import { useEffect, useState } from 'react';
import { Workspace, appStateMachine, getWorkspaceById } from '../../machines';
import { useInterpret } from '@xstate/react';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceManagerProps {
  workspaceId: string;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = () => {
  const service = useInterpret(appStateMachine);

  const [selectedWorkspace, setSelectedWorkspace] = useState<string>();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    const currentContext = service.getSnapshot().context;
    if (currentContext.workspaces) {
      const ws = getWorkspaceById(currentContext.workspaces, currentContext.activeWorkspaceId);
      if (ws) {
        setSelectedWorkspace(ws.id);
      }
    }
  }, [service]);

  const handleSelectWorkspace = (id: string) => {
    console.log('handleSelectWorkspace:', id);
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

  const handleAddWorkspace = (event) => {
    event.preventDefault();

    const newWorkspace: Workspace = {
      id: uuidv4(),
      name: newWorkspaceName,
      currentTab: 0,
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
              name: 'Hello',
              content: 'Welcome to the new workspace!',
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
        {service.getSnapshot().context.workspaces.map((w) => (
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
