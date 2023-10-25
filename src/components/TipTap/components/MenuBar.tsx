import { Editor } from '@tiptap/react';
import React, { useState, useEffect, useContext } from 'react';
import { useActor, useSelector } from '@xstate/react';
import { ACDoc, appStateMachine } from '../../../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../../context/GlobalStateContext';
import { useNavigate, useParams } from 'react-router-dom';
import { VectorStoreContext } from '../../../context/VectorStoreContext';
import { useMemoryVectorStore } from '../../../hooks/use-memory-vectorstore';
import { toastifyInfo } from '../../Toast';
import { slugify } from '../../../utils/data-utils';

interface MenuBarProps {
  editor: Editor | null;
  tipTapEditorId: string;
  systemNote: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor, tipTapEditorId }) => {
  const { appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [showMenu, setShowMenu] = useState(false);
  const { workspaceId, id: docId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const doc = useSelector(appStateService, (state) => {
    if (!docId) return;
    return state.context?.docs[docId];
  });

  const [state, send] = useActor(appStateService);
  const navigate = useNavigate();
  // const {
  //   vectorstore,
  //   addDocuments,
  //   similaritySearchWithScore,
  //   filterAndCombineContent,
  //   addText,
  // } = useContext(VectorStoreContext) as ReturnType<typeof useMemoryVectorStore>;

  // useEffect(() => {
  //   const doc = Object.values(docs).find((doc: ACDoc) => doc.id === docId);
  //   if (!doc) return;
  //   setSystemNoteState(doc.systemNote);
  //   if (doc) {
  //     setIsContext(doc.isContext);
  //     setSystemNoteState(doc.systemNote);
  //   }
  // }, [docs, state.context.workspaces, docId, workspaceId]);

  return (
    <div className="w-full h-full relative">
      <div className="flex w-full max-w-72 m-auto fixed justify-around z-100 bg-dark md:bg-opacity-90 shadow-lg p-2 md:rounded-2xl bottom-0">
        <button
          //@TODO: add acai red color
          className="font-bold hover:text-red-500 disabled:cursor-not-allowed"
          type="button"
          disabled={workspaceId === 'docs'}
          onClick={() => {
            if (!workspaceId) return;
            const confirmDelete = window.prompt('Type "delete" to confirm');
            if (confirmDelete?.toLowerCase() !== 'delete') {
              toastifyInfo('Deletion cancelled.');
              return;
            }

            send({
              type: 'DELETE_DOC',
              id: tipTapEditorId,
              workspaceId,
            });
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
        <button
          className="font-bold disabled:cursor-not-allowed"
          type="button"
          onClick={() => {
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
          Download
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
