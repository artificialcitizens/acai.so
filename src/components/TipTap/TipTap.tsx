/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { TiptapEditorProps } from './props';
import { TiptapExtensions } from './extensions';
import { useDebouncedCallback } from 'use-debounce';
import { EditorBubbleMenu } from './components';
// import { toastifyDefault, toastifyError } from '../Toast';
import { ACDoc } from '../../state';
// import { semanticSearchQueryGeneration } from '../../utils/ac-langchain/chains/semantic-search-query-chain';
import { autoComplete } from '../../lib/ac-langchain/chains/autocomplete-chain';
import Bottleneck from 'bottleneck';
import { MenuBar } from './components/MenuBar';
import './TipTap.css';
// import { useMemoryVectorStore } from '../../hooks/use-memory-vectorstore';
// import { VectorStoreContext } from '../../context/VectorStoreContext';
import { EditorContext } from '../../context/EditorContext';
import { toastifyError } from '../Toast';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useParams } from 'react-router-dom';
import { useSelector } from '@xstate/react';
interface EditorProps {
  tab: ACDoc;
}

// Limits our stream
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100,
});

const type = (text: string) => {
  return new Promise((resolve) => {
    resolve(text);
  });
};

const wrappedType = limiter.wrap(type);

export const extractContentFromTipTap = (tipTapContent: any): string => {
  let rawContent = '';
  console.time('setAutocompleteContext');
  if (tipTapContent.content) {
    tipTapContent.content.forEach((node: any) => {
      if (node.type === 'text') {
        rawContent += node.text;
      } else if (node.content) {
        rawContent += extractContentFromTipTap(node);
      }
    });
  }
  console.timeEnd('setAutocompleteContext');
  return rawContent;
};

// @TODO: create left right pagination with arrow and doc title
const Tiptap: React.FC<EditorProps> = ({ tab }) => {
  const { appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { setEditor } = useContext(EditorContext)!;
  const [currentContext, setCurrentContext] = useState('');
  // const {
  //   vectorstore,
  //   addDocuments,
  //   similaritySearchWithScore,
  //   filterAndCombineContent,
  // } = useContext(VectorStoreContext) as ReturnType<typeof useMemoryVectorStore>;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

  const saveContent = (editor: Editor) => {
    if (!tab) return;
    if (!tab.autoSave) return;
    setSaveStatus('Unsaved');
    const content = editor.getJSON();
    setSaveStatus('Saving...');
    appStateService.send({
      type: 'UPDATE_DOC_CONTENT',
      id: tab.id,
      content,
    });
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 500);
  };

  // /**
  //  * Creates context for the autocomplete vector search to inform autocomplete
  //  */
  // const setAutocompleteContext = async (editorContent: any) => {
  //   const context = extractContentFromTipTap(editorContent);
  //   const contextArrayLastTen = context.split(' ').slice(-10);

  //   const queryResults = await similaritySearchWithScore(
  //     contextArrayLastTen.join(' '),
  //   );

  //   const pageContent = queryResults.map((result: any) => {
  //     if (result.score < 0.79) return;
  //     return result[0].pageContent;
  //   });

  //   setCurrentContext(pageContent.join('\n'));
  // };

  const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    saveContent(editor);
  }, 500);

  const tokenQueue: string[] = [];
  let isProcessing = false;

  const processTokens = async () => {
    isProcessing = true;
    while (tokenQueue.length > 0) {
      const token = tokenQueue.shift();
      if (!token) break;
      await wrappedType(token);
      setCompletion((prevCompletion) => prevCompletion + token);
    }
    isProcessing = false;
  };

  const editor = useEditor(
    useMemo(
      () => ({
        extensions: TiptapExtensions,
        editorProps: TiptapEditorProps,
        onUpdate: async (e) => {
          setSaveStatus('Unsaved');
          const selection = e.editor.state.selection;
          const lastTwo = e.editor.state.doc.textBetween(
            selection.from - 2,
            selection.from,
            '\n',
          );
          if (lastTwo === '++' && !isLoading) {
            e.editor.commands.deleteRange({
              from: selection.from - 2,
              to: selection.from,
            });
            setIsLoading(true);
            // await setAutocompleteContext(e.editor);
            autoComplete({
              context: e.editor.state.doc.textBetween(
                Math.max(0, e.editor.state.selection.from - 5000),
                e.editor.state.selection.from - 0,
                '\n',
              ),
              relatedInfo: currentContext || '',
              callbacks: {
                onMessageStart: () => setIsLoading(true),
                onMessageError: (error: string) => {
                  console.error(error);
                  toastifyError(error);
                  setIsLoading(false);
                },
                onMessageStream: (token: string) => {
                  tokenQueue.push(token);
                  if (!isProcessing) {
                    processTokens();
                  }
                },
                onMessageComplete: (message: string) => {
                  // setIsLoading(false);
                },
              },
            }).then((res) => setIsLoading(false));
          } else {
            debouncedUpdates(e.editor);
          }
        },
        autofocus: 'start',
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        currentContext,
        debouncedUpdates,
        isLoading,
        isProcessing,
        tab?.canEdit,
        tokenQueue,
      ],
    ),
  );
  useEffect(() => {
    if (editor && tab) {
      editor.commands.setContent(tab.content ?? '');
    }
  }, [editor, tab]);

  const prev = useRef('');

  // Insert chunks of the generated text
  useEffect(() => {
    const diff =
      prev.current && completion ? completion.slice(prev.current.length) : '';
    prev.current = completion;
    editor?.commands.insertContent(diff);
  }, [isLoading, editor, completion]);

  useEffect(() => {
    // if user presses escape or cmd + z and it's loading,
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'z')) {
        stop();
        if (e.key === 'Escape') {
          editor?.commands.deleteRange({
            from: editor.state.selection.from - completion.length,
            to: editor.state.selection.from,
          });
        }
        editor?.commands.insertContent('++');
      }
    };
    const mousedownHandler = (e: MouseEvent) => {
      // e.preventDefault();
      // e.stopPropagation();
      // stop();
      // if (window.confirm('AI writing paused. Continue?')) {
      //   complete(editor?.getText() || '');
      // }
    };
    if (isLoading) {
      document.addEventListener('keydown', onKeyDown);
      window.addEventListener('mousedown', mousedownHandler);
    } else {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', mousedownHandler);
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', mousedownHandler);
    };
  }, [isLoading, editor, completion]);

  useEffect(() => {
    setEditor(editor);
    return () => {
      setEditor(null);
    };
  }, [editor, setEditor]);

  if (!tab) return null;

  return (
    <div className="h-[calc(100%-2.75rem)] flex flex-col">
      <h2 className="text-sm font-medium border-b border-solid border-dark text-acai-white mx-8 sm:mx-12 mt-8 mb-4 pb-1">
        {tab.title}
      </h2>
      {editor && <EditorBubbleMenu editor={editor} />}
      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="overflow-y-auto flex-grow w-full mb-3 px-8 border-none sm:rounded-lg sm:border sm:px-12 h-full max-h-[calc(100vh-6rem)]"
      >
        <EditorContent editor={editor} />
      </div>
      {/* <MenuBar
        editor={editor}
        tipTapEditorId={tab.id}
        systemNote={tab.systemNote}
      /> */}
    </div>
  );
};

export default Tiptap;
