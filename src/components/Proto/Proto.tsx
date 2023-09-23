import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useRef, useState } from 'react';
import { files } from './vite-files';
import { toastifyError, toastifyInfo } from '../Toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('jsx', jsx);

async function bootWebContainer() {
  toastifyInfo('Booting Web Container');
  return await WebContainer.boot();
}

async function installDependencies(webcontainerInstance: WebContainer) {
  const installProcess = await webcontainerInstance.spawn('yarn', ['install']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    }),
  );
  return installProcess.exit;
}

async function startDevServer(
  webcontainerInstance: WebContainer,
  iframeEl: HTMLIFrameElement,
) {
  toastifyInfo('Starting dev server');
  await webcontainerInstance.spawn('yarn', ['run', 'dev']);
  webcontainerInstance.on('server-ready', (port, url) => {
    iframeEl.src = url;
  });
}

async function writeIndexJS(
  webcontainerInstance: WebContainer,
  content: string,
) {
  await webcontainerInstance.fs.writeFile('src/App.tsx', content);
}

const instance = await bootWebContainer();

const Proto = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const syntaxHighlighterRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [isEditorVisible, setEditorVisible] = useState(true);
  const [isEditMode, setEditMode] = useState(true);
  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: text,
  });

  const toggleEditMode = () => {
    setEditMode(!isEditMode);
  };

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(text);
    }
  }, [editor, text]);

  useEffect(() => {
    if (!editor) return;
    editor.on('update', () => {
      const json = editor.getJSON();
      const formattedText = JSON.stringify(json, null, 2);
      setText(formattedText);
      instance && writeIndexJS(instance, formattedText);
      localStorage.setItem('App.tsx', formattedText);
    });
  }, [editor]);

  useEffect(() => {
    const mountWebContainer = async () => {
      if (!iframeRef.current) throw new Error('iframe not found');

      await instance.mount(files);

      toastifyInfo('Installing dependencies');
      const exitcode = await installDependencies(instance);

      if (exitcode !== 0) {
        toastifyError('Error encountered installing dependencies');
        throw new Error('Failed to install dependencies');
      }

      startDevServer(instance, iframeRef.current);
    };
    const localStorageContent = localStorage.getItem('App.tsx');
    setText(
      localStorageContent || files.src.directory['App.tsx'].file.contents,
    );
    mountWebContainer();
  }, []);

  return (
    <div className="p-8 flex flex-col h-full w-full relative">
      <h1 className="text-2xl">WebContainer</h1>
      <section className="flex flex-col flex-grow w-full h-full relative">
        <iframe
          title="prototype view"
          ref={iframeRef}
          className="h-[82vh] w-full rounded-lg overflow-hidden"
          src=""
        ></iframe>
        <span
          className="p-2 bg-dark w-full rounded-lg opacity-[90] max-h-[82vh] absolute transition-all duration-500 ease-in-out"
          style={
            isEditorVisible
              ? { height: '82vh', overflow: 'hidden' }
              : {
                  height: '2rem',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                }
          }
        >
          {isEditorVisible && (
            <>
              <textarea
                ref={inputRef}
                spellCheck="false"
                className={`bg-transparent flex-grow h-full w-full rounded-lg p-4 text-base text-transparent font-mono mt-2 ${
                  isEditMode ? '' : 'opacity-0 pointer-events-none'
                }`}
                value={text}
                onScroll={(e) => {
                  if (syntaxHighlighterRef.current) {
                    syntaxHighlighterRef.current.scrollTop =
                      e.currentTarget.scrollTop;
                  }
                }}
                style={{
                  lineHeight: '1.5rem',
                  margin: '2rem',
                  padding: '0',
                  //@TODO: update to theme color
                  caretColor: '#E7E9E5',
                  height: isEditorVisible ? 'calc(82vh - 2rem)' : '0',
                  maxHeight: 'calc(82vh - 2rem)',
                  position: 'absolute',
                  zIndex: 1,
                }}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setText(newValue);
                  (async () => {
                    if (instance) {
                      await writeIndexJS(instance, newValue);
                    }
                    localStorage.setItem('App.tsx', newValue);
                  })();
                }}
              ></textarea>
              <div
                ref={syntaxHighlighterRef}
                style={{
                  overflow: 'auto',
                  height: isEditorVisible ? 'calc(82vh - 2rem)' : '0',
                  lineHeight: '1.5rem',
                  padding: '1rem',
                  margin: '0',
                }}
              >
                <SyntaxHighlighter
                  wrapLines={true}
                  language="jsx"
                  style={oneDark}
                  customStyle={{
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    zIndex: 0,
                    lineHeight: '1.5rem', // Ensure line-height is the same
                    padding: '1rem', // Ensure padding is the same
                    margin: '0', // Ensure margin is the same
                  }}
                >
                  {text}
                </SyntaxHighlighter>
              </div>
              {/* <button
                onClick={toggleEditMode}
                className="absolute top-3 right-8 m-2 text-xs font-bold text-acai-white z-10"
              >
                {isEditMode ? 'View' : 'Edit'}
              </button> */}
            </>
          )}
          <button
            onClick={() => setEditorVisible(!isEditorVisible)}
            className="absolute top-3 right-2 m-2 text-xs font-bold text-acai-white z-10"
          >
            {!isEditorVisible ? 'view code' : 'x'}
          </button>
        </span>
      </section>
    </div>
  );
};

export default Proto;
