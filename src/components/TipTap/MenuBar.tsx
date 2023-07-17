import { Editor } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { useInterpret } from '@xstate/react';
import { appStateMachine } from '../../state';
import { FloatingButton } from '../FloatingButton/FloatingButton';

interface MenuBarProps {
  editor: Editor | null;
  tipTapEditorId: string;
  systemNote: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor, tipTapEditorId, systemNote }) => {
  const service = useInterpret(appStateMachine);
  const [isContext, setIsContext] = useState(false);
  const [systemNoteState, setSystemNoteState] = useState(systemNote);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      const ws = state.context.workspaces[state.context.activeWorkspaceId];
      const tab = ws?.data.tiptap.tabs.find((tab) => tab.id === tipTapEditorId);
      if (tab) {
        setIsContext(tab.isContext);
        setSystemNoteState(tab.systemNote);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [service, tipTapEditorId]);

  return (
    <div className="tiptap-menu flex items-center justify-around relative bg-darker ml-8">
      <span>
        <FloatingButton handleClick={() => setShowMenu(!showMenu)} />
      </span>
      {showMenu && (
        <>
          <button
            onClick={async () => {
              service.send({
                type: 'TOGGLE_CONTEXT',
                id: tipTapEditorId,
                workspaceId: service.getSnapshot().context.activeWorkspaceId,
              });
            }}
          >
            Context {isContext ? ' ✅' : ' ◻️'}
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
            className="p-2 bg-red-900 rounded-md text-light"
            onClick={async () => {
              setLoading(true);
              service.send({
                type: 'DELETE_TAB',
                id: tipTapEditorId,
                workspaceId: service.getSnapshot().context.activeWorkspaceId,
              });
              setLoading(false);
            }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
};
