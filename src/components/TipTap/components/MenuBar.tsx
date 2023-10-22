import { Editor } from '@tiptap/react';
import React, { useState, useEffect, useContext } from 'react';
import { useActor, useInterpret } from '@xstate/react';
import { DocType, appStateMachine } from '../../../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../../context/GlobalStateContext';
import { useNavigate, useParams } from 'react-router-dom';
import { VectorStoreContext } from '../../../context/VectorStoreContext';
import { useMemoryVectorStore } from '../../../hooks/use-memory-vectorstore';

interface MenuBarProps {
  editor: Editor | null;
  tipTapEditorId: string;
  systemNote: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor, tipTapEditorId }) => {
  const { appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [isContext, setIsContext] = useState(false);
  const [systemNoteState, setSystemNoteState] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const workspaceId = rawWorkspaceId || 'docs';
  const tabId = location.pathname.split('/')[2];
  const [state, send] = useActor(appStateService);
  const navigate = useNavigate();
  const {
    vectorstore,
    addDocuments,
    similaritySearchWithScore,
    filterAndCombineContent,
    addText,
  } = useContext(VectorStoreContext) as ReturnType<typeof useMemoryVectorStore>;

  useEffect(() => {
    const ws = state.context.workspaces[workspaceId];
    const tab = ws?.docs.find((tab: DocType) => tab.id === tabId);
    if (!tab) return;
    setSystemNoteState(tab.systemNote);
    if (tab) {
      console.log('Updating local state:', tab); // Add this line for debugging
      setIsContext(tab.isContext);
      setSystemNoteState(tab.systemNote);
    }
  }, [state.context.workspaces, tabId, workspaceId]);

  return (
    <div className="w-full h-full relative">
      <div className="flex w-1/2 md:w-1/3 max-w-72 m-auto fixed justify-around z-100 bg-dark bg-opacity-90 shadow-lg p-2 rounded-2xl bottom-4 right-1/2">
        <button
          className="font-bold hover:text-red-800 disabled:cursor-not-allowed"
          type="button"
          // disabled={pageNumber <= 1}
          onClick={() => {
            setLoading(true);
            send({
              type: 'DELETE_TAB',
              id: tipTapEditorId,
              workspaceId,
            });
            setLoading(false);
            navigate(`/${workspaceId}`);
          }}
        >
          {'x'}
        </button>
        <button
          className="font-bold disabled:cursor-not-allowed"
          type="button"
          // disabled={pageNumber <= 1}
          // onClick={() => setPageNumber((prevPageNumber) => prevPageNumber - 1)}
        >
          {'<'}
        </button>
        {/* <p className="font-medium">
          {pageNumber}/{numPages}
        </p> */}
        <button
          className="font-bold disabled:cursor-not-allowed"
          type="button"
          // disabled={pageNumber >= numPages}
          // onClick={() => setPageNumber((prevPageNumber) => prevPageNumber + 1)}
        >
          {'>'}
        </button>
        {/* <button
          className={`font-bold disabled:cursor-not-allowed mt-2 ${
            isContext && 'text-acai-primary'
          }`}
          type="button"
          // disabled={pageNumber >= numPages}
          onClick={() => {
            send({
              type: 'TOGGLE_CONTEXT',
              id: tipTapEditorId,
              workspaceId,
            });
            setIsContext(!isContext);
          }}
        >
          {'^'}
        </button> */}
        {/* <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button> */}
      </div>
    </div>
  );
};
// return (
//   <div className=" bg-darker">
//     <span className="absolute bottom-12">
//       <FloatingButton handleClick={() => setShowMenu(!showMenu)} />
//     </span>
//     {showMenu && (
//       <div className="flex items-center justify-around left-12 bg-dark p-8">
//         <button
//           onClick={async () => {
//             console.log('Sending TOGGLE_CONTEXT event'); // Add this line for debugging
//             send({
//               type: 'TOGGLE_CONTEXT',
//               id: tipTapEditorId,
//               workspaceId,
//             });
//             setIsContext(!isContext);
//           }}
//         >
//           Context {isContext ? ' ✅' : ' ◻️'}
//         </button>

//         <textarea
//           value={systemNoteState}
//           className="w-96 rounded-md p-2 bg-base text-acai-white"
//           placeholder="System Note"
//           onChange={(e) => {
//             setSystemNoteState(e.target.value);
//             send({
//               type: 'UPDATE_TAB_SYSTEM_NOTE',
//               id: tipTapEditorId,
//               systemNote: e.target.value,
//               workspaceId,
//             });
//           }}
//         />
//         <button
//           className="p-2 bg-red-900 rounded-md text-acai-white"
//           onClick={async () => {
//             setLoading(true);
//             send({
//               type: 'DELETE_TAB',
//               id: tipTapEditorId,
//               workspaceId,
//             });
//             setLoading(false);
//             navigate(`/${workspaceId}`);
//           }}
//         >
//           Delete
//         </button>
//       </div>
//     )}
//   </div>
// );
