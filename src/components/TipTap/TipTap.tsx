import { useContext, useEffect, useId, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { TiptapEditorProps } from './props';
import { TiptapExtensions } from './extensions';
import { useDebouncedCallback } from 'use-debounce';
import { EditorBubbleMenu } from './components';
import { toastifyDefault, toastifyError } from '../Toast';
import { marked } from 'marked';
import { useInterpret } from '@xstate/react';
import { appStateMachine } from '../../machines';
import { VectorStoreContext } from '../../context/VectorStoreContext';
import useCookieStorage from '../../hooks/use-cookie-storage';
import { semanticSearchQuery } from '../../utils/sb-langchain/chains/semantic-search-query-chain';
import { autoComplete } from '../../utils/sb-langchain/chains/autocomplete-chain';
import Bottleneck from 'bottleneck';

interface EditorProps {
  id: string;
  title: string;
  content: string;
  updateContent: (id: string, content: { title: string; content: string }) => void;
}

// Limits our stream
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100,
});

const type = (text) => {
  return new Promise((resolve) => {
    resolve(text);
  });
};

const wrappedType = limiter.wrap(type);

const Tiptap: React.FC<EditorProps> = ({ id, title, content, updateContent }) => {
  const service = useInterpret(appStateMachine);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [tab, setTab] = useState(null);
  const { vectorstore, addDocuments, similaritySearchWithScore } = useContext(VectorStoreContext);
  const [openAIApiKey, setOpenAIKey] = useCookieStorage('OPENAI_KEY');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState('');

  const saveContent = (editor: Editor, workspaceId: string) => {
    const content = editor.getText();
    setSaveStatus('Saving...');
    service.send({ type: 'UPDATE_TAB_CONTENT', id, content, workspaceId });
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 100);
  };

  const setContext = async (editor: Editor) => {
    const context = editor.getText();
    // if the context is too short we'll just genarate results based on the current context
    // @TODO: first conditional
    // we generate results based on the context
    const results: string[] = await semanticSearchQuery(context, openAIApiKey!);
    // @TODO: we can set a dropdown with the 3 most relevant autofills suggestions based on the results of the semantic search queries
    console.log(results[0] + ' ' + results[1] + ' ' + results[2]);
    const queryResults = await similaritySearchWithScore(`${results[0]} ${results[1]} ${results[2]}`);
    const pageContent = queryResults.map((result) => {
      // @TODO: filter by score
      if (result.score < 0.75) return;
      return result[0].pageContent;
    });

    setCurrentContext(pageContent.join('\n'));
  };
  // useEffect(() => {
  //   if (!openAIApiKey) {
  //     toastifyError('Please set your OpenAI API key in the settings menu');
  //     return;
  //   }
  //   semanticSearchQuery(
  //     '- Design tokens are a way to abstract and manage the visual design elements of a user interface, such as colors, typography, spacing, and other visual properties. They are essentially a set of values that represent design decisions, which can be reused and referenced throughout a project, allowing for consistency in the design across different platforms and devices.',
  //     openAIApiKey,
  //   ).then((res) => console.log(res));
  //   // similaritySearchWithScore('what is knapsack?', 4).then((res) => console.log(res));
  //   return () => {
  //     // cleanup
  //   };
  // }, [openAIApiKey]); // Add openAIApiKey as a dependency

  useEffect(() => {
    service.onTransition((state) => {
      if (state.context.workspaces) {
        setCurrentWorkspace(
          state.context.workspaces.find((workspace) => workspace.id === state.context.activeWorkspaceId),
        );
      }
    });
  }, [service]);

  useEffect(() => {
    if (currentWorkspace) {
      setTab(currentWorkspace.data.tiptap.tabs.find((tab) => tab.id === id));
    }
  }, [currentWorkspace, id]);

  const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    if (!currentWorkspace) return;
    saveContent(editor, currentWorkspace.id);
    await setContext(editor);
  }, 1000);

  const tokens: string[] = [];
  let isProcessing = false;

  const processTokens = async () => {
    isProcessing = true;
    while (tokens.length > 0) {
      const token = tokens.shift();
      await wrappedType(token);
      setCompletion((prevCompletion) => prevCompletion + token);
    }
    isProcessing = false;
  };

  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (e) => {
      setSaveStatus('Unsaved');
      const selection = e.editor.state.selection;
      const lastTwo = e.editor.state.doc.textBetween(selection.from - 2, selection.from, '\n');
      if (lastTwo === '++' && !isLoading) {
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });

        autoComplete({
          context: e.editor.getText(),
          relatedInfo: currentContext || '',
          openAIApiKey,
          callbacks: {
            onMessageStart: () => setIsLoading(true),
            onMessageError: (error: string) => {
              console.log(error);
              setIsLoading(false);
            },
            onMessageStream: (token: string) => {
              tokens.push(token);
              if (!isProcessing) {
                processTokens();
              }
            },
            onMessageComplete: (message: string) => {
              // setIsLoading(false);
            },
          },
        }).then((res) => setIsLoading(false));
        // // we're using this for now until we can figure out a way to stream markdown text with proper formatting: https://github.com/steven-tey/novel/discussions/7
        // complete(e.editor.getText(), {
        //   body: {
        //     prompt: e.editor.getText(),
        //   },
        // });
        // // complete(e.editor.storage.markdown.getMarkdown());
      } else {
        debouncedUpdates(e.editor);
      }
    },
    autofocus: 'end',
  });

  useEffect(() => {
    if (editor && tab && !hydrated) {
      console.log(tab);
      editor.commands.setContent(marked(tab.content));
      setHydrated(true);
    }
  }, [editor, tab, hydrated]);

  const prev = useRef('');

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = prev.current && completion ? completion.slice(prev.current.length) : '';
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

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(marked(content));
      setHydrated(true);
    }
  }, [editor, content, hydrated]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className="relative max-h-[95vh] min-h-full  overflow-scroll w-full max-w-screen-lg p-12 px-8 sm:mb-[calc(20vh)] border-none sm:rounded-lg sm:border sm:px-12"
    >
      <div className="absolute flex right-5 top-5 mb-5 rounded-lg bg-base px-2 py-1 text-sm text-light">
        {saveStatus}
      </div>
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
