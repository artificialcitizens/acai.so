/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { ACDoc, Workspace, handleCreateDoc } from '../../state';
import { useLoadWorkspace } from '../../hooks/use-load-workspace';
import { useSaveWorkspace } from '../../hooks/use-save-workspace';
// import { EditorContext } from '../../context/EditorContext';
// import { toastifyInfo } from '../Toast';
// import { useSelector } from '@xstate/react';
// import { slugify } from '../../utils/data-utils';

interface DropdownSettingsProps {
  onClose: () => void;
}

const DropdownSettings: React.FC<DropdownSettingsProps> = ({ onClose }) => {
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const { editor } = useContext(EditorContext)!;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { workspaceId, id: activeTabId } = useParams<{
    workspaceId: string;
    id: string;
  }>();
  const { loadWorkspace } = useLoadWorkspace();
  const { saveWorkspace } = useSaveWorkspace();
  // const doc = useSelector(globalServices.appStateService, (state) => {
  //   if (!activeTabId) return;
  //   return state.context?.docs?.[activeTabId];
  // });
  const handleImportClick = () => {
    // Trigger click on file input
    fileInputRef.current?.click();
  };

  // @TODO: use create workspace from state machine
  const createWorkspace = () => {
    const id = uuidv4();
    const tabId = uuidv4();
    const name = prompt('Enter a name for your new workspace');
    if (!name) return;
    const newWorkspace: Workspace = {
      id,
      name,
      createdAt: new Date().toString(),
      lastUpdated: new Date().toString(),
      private: false,
      docIds: [tabId],
    };
    const doc: ACDoc = {
      id: tabId,
      title: `Welcome to ${name}!`,
      content: '',
      createdAt: new Date().toString(),
      lastUpdated: new Date().toString(),
      workspaceId: id,
      filetype: 'md',
      canEdit: true,
      autoSave: true,
      isContext: false,
      systemNote: '',
    };
    globalServices.appStateService.send('ADD_WORKSPACE', {
      workspace: newWorkspace,
      doc,
    });

    globalServices.agentStateService.send('CREATE_AGENT', {
      workspaceId: id,
    });

    onClose();
    setTimeout(() => {
      navigate(`/${id}/documents/${tabId}`);
    }, 250);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Process the selected file
    try {
      const { workspaceId, docId } = await loadWorkspace(file);
      navigate(`/${workspaceId}/documents/${docId}`);
    } catch (error) {
      console.error(error);
    } finally {
      onClose();
    }
  };

  const handleDeleteWorkspace = () => {
    if (!workspaceId) return;
    const confirmDelete = window.prompt('Type "delete" to confirm');
    if (confirmDelete?.toLowerCase() !== 'delete') {
      alert('Deletion cancelled.');
      return;
    }
    globalServices.appStateService.send({
      type: 'DELETE_WORKSPACE',
      workspaceId,
    });
    globalServices.agentStateService.send({
      type: 'DELETE_AGENT',
      workspaceId,
    });
    onClose();
    // @TODO: delete all associated knowledge items and files
    setTimeout(() => {
      navigate('/');
    }, 250);
  };

  const createTab = async (workspaceId: string) => {
    const title = prompt('Enter a name for your new tab');
    if (!title) return;
    const tab: ACDoc = await handleCreateDoc(
      { title, content: '' },
      workspaceId,
    );
    globalServices.appStateService.send({
      type: 'ADD_DOC',
      doc: tab,
    });
    onClose();
    setTimeout(() => {
      navigate(`/${workspaceId}/documents/${tab.id}`);
    }, 250);
  };
  return (
    <>
      <div className="py-1 px-2" role="none">
        <p className="text-xs text-center" role="none">
          Workspaces
        </p>
        <button
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light pl-2 transition duration-150 ease-linear text-left"
          onClick={createWorkspace}
        >
          New
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light  pl-2 transition duration-150 ease-linear text-left"
          onClick={handleImportClick}
        >
          Import
        </button>
        <button
          disabled={workspaceId === 'docs'}
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light disabled:text-gray-400 disabled:hover:text-gray-400 pl-2 transition duration-150 ease-linear text-left"
          onClick={() => {
            if (!workspaceId) return;
            saveWorkspace(workspaceId);
            onClose();
          }}
        >
          Export
        </button>
        <button
          disabled={workspaceId === 'docs'}
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light disabled:text-gray-400 disabled:hover:text-gray-400 pl-2 transition duration-150 ease-linear text-left"
          onClick={handleDeleteWorkspace}
        >
          Delete
        </button>
      </div>
      <div className="py-1 px-2" role="none">
        <p className="text-xs text-center" role="none">
          Docs
        </p>
        <button
          disabled={workspaceId === 'docs'}
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light disabled:text-gray-400 disabled:hover:text-gray-400 pl-2 transition duration-150 ease-linear text-left"
          onClick={() => {
            if (!workspaceId) return;
            createTab(workspaceId);
          }}
        >
          New
        </button>
        <button
          disabled={workspaceId === 'docs'}
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light disabled:text-gray-400 disabled:hover:text-gray-400 pl-2 transition duration-150 ease-linear text-left"
          onClick={async () => {
            if (!workspaceId || !activeTabId) return;
            onClose();
            const confirmDelete = window.prompt('Type "delete" to confirm');
            if (confirmDelete?.toLowerCase() !== 'delete') {
              return;
            }
            globalServices.appStateService.send({
              type: 'DELETE_DOC',
              id: activeTabId,
              workspaceId,
            });
            setTimeout(() => {
              navigate(`/${workspaceId}`);
            }, 250);
          }}
        >
          Delete
        </button>
        {/* <button
          className="px-4 py-2 block w-full rounded-none text-acai-white text-sm hover:text-acai-light pl-2 transition duration-150 ease-linear text-left"
          onClick={() => {
            onClose();
            if (!editor || !doc) {
              toastifyInfo(
                !editor
                  ? 'Editor is not available.'
                  : 'Document is not available.',
              );
              return;
            }

            const content = editor.getHTML(); // or editor.getJSON() for JSON format
            const blob = new Blob([content], { type: 'text/html' }); // or 'application/json' for JSON format
            const url = URL.createObjectURL(blob);
            const { filetype, title } = doc;
            const link = document.createElement('a');
            link.href = url;
            link.download = `${slugify(title)}.${filetype}`;
            link.click();

            URL.revokeObjectURL(url);
          }}
        >
          Export as File
        </button> */}
      </div>
    </>
  );
};

export default DropdownSettings;
