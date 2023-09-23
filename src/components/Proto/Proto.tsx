import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { GlobalStateContext } from '../../context/GlobalStateContext';
import { files } from './vite-files';
import { toastifyError, toastifyInfo } from '../Toast';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useActor } from '@xstate/react';

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

// const instance = await bootWebContainer();

interface ProtoProps {
  fileContent?: string;
}

const Proto: React.FC<ProtoProps> = ({ fileContent }) => {
  const { protoStateService } = useContext(GlobalStateContext);
  const [protoState] = useActor(protoStateService);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const syntaxHighlighterRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [isEditorVisible, setEditorVisible] = useState(true);
  const [isEditMode, setEditMode] = useState(true);
  const [originalText, setOriginalText] = useState<string>('');

  const toggleEditMode = () => {
    setEditMode(!isEditMode);
  };
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    const bootInstance = async () => {
      const newInstance = await bootWebContainer();
      setInstance(newInstance);
    };

    bootInstance();
  }, []);

  useEffect(() => {
    const mountWebContainer = async (initialContent: string) => {
      if (!iframeRef.current) throw new Error('iframe not found');
      if (!instance) throw new Error('instance not found');
      await instance.mount(files);

      toastifyInfo('Installing dependencies');
      const exitcode = await installDependencies(instance);

      if (exitcode !== 0) {
        toastifyError('Error encountered installing dependencies');
        throw new Error('Failed to install dependencies');
      }
      if (instance) {
        await writeIndexJS(instance, initialContent);
      }
      startDevServer(instance, iframeRef.current).then(() => {
        toastifyInfo('Dev server started');
      });
    };
    const localStorageContent = localStorage.getItem('App.tsx');
    setOriginalText(files.src.directory['App.tsx'].file.contents || '');
    const initialContent =
      fileContent ||
      localStorageContent ||
      files.src.directory['App.tsx'].file.contents;

    setText(initialContent);
    mountWebContainer(initialContent);
  }, [fileContent, instance]);
  useEffect(() => {
    const newValue = protoState.context.fileContent;
    if (!newValue) return;
    setText(newValue);
    (async () => {
      // Check if newValue is defined
      if (instance) {
        await writeIndexJS(instance, newValue);
      }
      localStorage.setItem('App.tsx', newValue);
    })();
  }, [instance, protoState.context.fileContent]);

  return (
    <div className="p-8 flex flex-col h-full w-full relative">
      <h1 className="text-2xl">Web Container</h1>
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
                  height: '3rem',
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
                  height: isEditorVisible ? 'calc(82vh - 2rem)' : '1rem',
                  maxHeight: 'calc(82vh - 2rem)',
                  position: 'absolute',
                  zIndex: 1,
                }}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setText(newValue);
                  protoStateService.send({
                    type: 'UPDATE_FILE_CONTENT',
                    fileContent: newValue,
                  });
                  (async () => {
                    if (instance) {
                      await writeIndexJS(instance, newValue);
                    }
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
              <button
                className="absolute top-4 right-12 m-2 text-xs font-bold text-acai-white z-10"
                onClick={() => {
                  const resetConfirm = window.prompt(
                    'This will reset all code to default. Type "reset" to confirm.',
                  );
                  if (resetConfirm !== 'reset') return;
                  setText(originalText);
                  (async () => {
                    if (instance) {
                      await writeIndexJS(instance, originalText);
                    }
                    localStorage.setItem('App.tsx', originalText);
                  })();
                }}
              >
                Reset
              </button>
            </>
          )}

          <button
            onClick={() => setEditorVisible(!isEditorVisible)}
            className="absolute top-4 right-6 m-2 text-xs font-bold text-acai-white z-10"
          >
            {!isEditorVisible ? 'view code' : 'x'}
          </button>
        </span>
      </section>
    </div>
  );
};

export default Proto;
