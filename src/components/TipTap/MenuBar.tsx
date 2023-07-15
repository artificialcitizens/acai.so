import { Editor } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { useInterpret } from '@xstate/react';
import { appStateMachine, getWorkspaceById } from '../../machines';

interface MenuBarProps {
  editor: Editor | null;
  tipTapEditorId: string;
  systemNote: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor, tipTapEditorId, systemNote }) => {
  const service = useInterpret(appStateMachine);
  const [isContext, setIsContext] = useState(false); // Add state for isContext
  const [systemNoteState, setSystemNoteState] = useState(systemNote); // Add state for systemNote

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      const ws = getWorkspaceById(state.context.workspaces, state.context.activeWorkspaceId);
      const tab = ws?.data.tiptap.tabs.find((tab) => tab.id === tipTapEditorId);
      tab?.isContext && setIsContext(tab?.isContext);
      tab?.systemNote && setSystemNoteState(tab?.systemNote); // Update systemNote state
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [service, tipTapEditorId]);

  return (
    <div className="tiptap-menu">
      <button
        onClick={async () => {
          service.send({
            type: 'TOGGLE_CONTEXT',
            id: tipTapEditorId,
            workspaceId: service.getSnapshot().context.activeWorkspaceId,
          });
        }}
      >
        Context {isContext ? ' ✅' : ' ❌'}
      </button>
      <textarea
        value={systemNoteState}
        onChange={(e) => {
          setSystemNoteState(e.target.value);
          service.send({
            type: 'UPDATE_TAB_SYSTEM_NOTE',
            id: tipTapEditorId,
            systemNote: e.target.value,
            workspaceId: service.getSnapshot().context.activeWorkspaceId,
          });
        }}
      />
      <button
        onClick={async () => {
          service.send({
            type: 'DELETE_TAB',
            id: tipTapEditorId,
          });
        }}
      >
        Delete
      </button>
    </div>
  );
};
