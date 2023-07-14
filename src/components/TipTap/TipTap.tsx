import { useEffect, useId, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { TiptapEditorProps } from './props';
import { TiptapExtensions } from './extensions';
import useLocalStorage from '../../hooks/use-local-storage';
import { useDebouncedCallback } from 'use-debounce';
import { useCompletion } from 'ai/react';

import { EditorBubbleMenu } from './components';
import { toastifyDefault, toastifyError } from '../Toast';
import { marked } from 'marked';
import { useInterpret } from '@xstate/react';
import { appStateMachine } from '../../machines';

interface EditorProps {
  id: string;
  title: string;
  content: string;
  updateContent: (id: string, content: { title: string; content: string }) => void;
}

const Tiptap: React.FC<EditorProps> = ({ id, title, content, updateContent }) => {
  const service = useInterpret(appStateMachine);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [tab, setTab] = useState(null);

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

  const debouncedUpdates = useDebouncedCallback((editor) => {
    const content = editor.getText();
    setSaveStatus('Saving...');
    service.send({ type: 'UPDATE_TAB_CONTENT', id, content, workspaceId: currentWorkspace.id });
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 100);
  }, 750);

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
        // we're using this for now until we can figure out a way to stream markdown text with proper formatting: https://github.com/steven-tey/novel/discussions/7
        complete(e.editor.getText(), {
          body: {
            prompt: e.editor.getText(),
          },
        });
        // complete(e.editor.storage.markdown.getMarkdown());
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

  const { complete, completion, isLoading, stop } = useCompletion({
    id: 'novel',
    api: 'http://192.168.4.74:3000/autocomplete',
    headers: {
      'Content-Type': 'application/json',
    },
    onResponse: (response) => {
      if (response.status === 429) {
        toastifyError('You have reached your request limit for the day.');
        return;
      }
    },
    onFinish: (_prompt, completion) => {
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: () => {
      toastifyError('Something went wrong.');
    },
  });

  const prev = useRef('');

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
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
      e.preventDefault();
      e.stopPropagation();
      stop();
      if (window.confirm('AI writing paused. Continue?')) {
        complete(editor?.getText() || '');
      }
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
  }, [stop, isLoading, editor, complete, completion.length]);

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
