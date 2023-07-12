import { useState } from 'react';
import { EventObject } from 'xstate';
import { Workspace } from '../../machines';

interface Context {
  workspaces: Workspace[];
}

interface Send {
  (event: EventObject): void;
}

interface Props {
  context: Context;
  send: Send;
}

export const WorkspaceManager = ({ context, send }: Props) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState(context.workspaces[0].id);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspace(id);
  };

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleUpdateWorkspace = (id: string, updates: Partial<Workspace>) => {
    send({
      type: 'UPDATE_WORKSPACE',
      id,
      workspace: updates,
    });
  };

  const handleDeleteWorkspace = (id: string) => {
    send({
      type: 'DELETE_WORKSPACE',
      id,
    });
  };

  const handleAddWorkspace = (event) => {
    event.preventDefault();

    const newWorkspace: Workspace = {
      id: generateId(),
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
              id: generateId(),
              name: 'New Tab',
              content: {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Welcome to the new workspace!' }] }],
              },
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

    console.log('Sending ADD_WORKSPACE event', newWorkspace);

    send({
      type: 'ADD_WORKSPACE',
      workspace: newWorkspace,
    });

    setNewWorkspaceName('');
  };

  return (
    <div>
      <select value={selectedWorkspace} onChange={(e) => handleSelectWorkspace(e.target.value)}>
        {context.workspaces.map((w) => (
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
        <button type="submit">Add Workspace</button>
      </form>

      <button onClick={() => handleUpdateWorkspace(selectedWorkspace, { name: 'New Name' })}>Update Workspace</button>

      <button onClick={() => handleDeleteWorkspace(selectedWorkspace)}>Delete Workspace</button>
    </div>
  );
};
