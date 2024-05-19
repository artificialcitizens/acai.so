import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { GlobalStateContext } from '../../context/GlobalStateContext';
import { files } from './react-files';
import { toastifyError, toastifyInfo } from '../../components/Toast';
import { useActor, useSelector } from '@xstate/react';

/**
 * Creates a new directory in the WebContainer file system.
 * @param webcontainerInstance - The instance of the WebContainer.
 * @param path - The path of the directory to create.
 * @param recursive - Whether to create parent directories if they do not exist.
 */
export async function createDirectory(
  webcontainerInstance: WebContainer,
  path: string,
  recursive: false | undefined,
): Promise<void> {
  try {
    await webcontainerInstance.fs.mkdir(path, { recursive });
    console.log(`Directory created at ${path}`);
  } catch (error) {
    console.error(`Failed to create directory at ${path}:`, error);
  }
}

/**
 * Creates a new file in the WebContainer file system.
 * @param webcontainerInstance - The instance of the WebContainer.
 * @param path - The path of the file to create.
 * @param content - The content to write to the file.
 */
export async function createFile(
  webcontainerInstance: WebContainer,
  path: string,
  content: string,
): Promise<void> {
  try {
    await webcontainerInstance.fs.writeFile(path, content);
    console.log(`File created at ${path}`);
  } catch (error) {
    console.error(`Failed to create file at ${path}:`, error);
  }
}

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
  await webcontainerInstance.spawn('yarn', ['run', 'dev']);
  webcontainerInstance.on('server-ready', (port, url) => {
    iframeEl.src = url;
  });
}

async function writeIndexJS(
  webcontainerInstance: WebContainer,
  content: string,
) {
  await webcontainerInstance.fs.writeFile(
    'src/components/root/App.tsx',
    content,
  );
}

interface File {
  contents: string;
}

interface Directory {
  [key: string]: { file?: File; directory?: Directory };
}

// your existing structure here
function findAppTsx(directory: Directory): File | null {
  for (const key in directory) {
    if (key === 'App.tsx' && directory[key].file) {
      return directory[key].file || null;
    }
    if (directory[key].directory) {
      const result = findAppTsx(directory[key].directory || {});
      if (result) {
        return result;
      }
    }
  }
  return null;
}

const appTsxFile = findAppTsx(files);
if (appTsxFile) {
  console.log(appTsxFile.contents);
} else {
  console.error('App.tsx not found');
}

export function useProto() {
  const { protoStateService } = useContext(GlobalStateContext);
  const [protoState] = useActor(protoStateService);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [text, setText] = useState('');
  const fileContent = useSelector(
    protoStateService,
    (state) => state.context.fileContent,
  );

  const [instance, setInstance] = useState<WebContainer | null>(null);

  const mountWebContainer = useCallback(
    async (initialContent: string) => {
      if (!iframeRef.current) throw new Error('iframe not found');
      if (!instance) throw new Error('instance not found');

      await instance.mount(files);

      if (instance) {
        await writeIndexJS(instance, initialContent);
      }
      setText(initialContent);
      const nodeModulesExists = await instance.fs
        .readdir('node_modules')
        .catch(() => false);

      if (!nodeModulesExists) {
        toastifyInfo('Installing dependencies');
        const exitcode = await installDependencies(instance);
        if (exitcode !== 0) {
          toastifyError('Error encountered installing dependencies');
          throw new Error('Failed to install dependencies');
        }
        startDevServer(instance, iframeRef.current).then(() => {
          toastifyInfo('Dev server started');
        });
      }
    },
    [instance, iframeRef],
  );

  useEffect(() => {
    if (!fileContent || !instance) return;
    setText(fileContent);
    // (async () => {
    //   if (instance) {
    //     await writeIndexJS(instance, fileContent);
    //   }
    // })();
  }, [fileContent, instance, protoState.context.fileContent]);

  useEffect(() => {
    const bootInstance = async () => {
      if (!instance) {
        const newInstance = await bootWebContainer();
        setInstance(newInstance);
      }
    };

    bootInstance();
  }, [instance]);

  useEffect(() => {
    if (instance) {
      const appTsxFile = findAppTsx(files);
      if (fileContent || appTsxFile?.contents) {
        setOriginalText(appTsxFile?.contents || '');

        const initialContent = fileContent || appTsxFile?.contents || '';

        mountWebContainer(initialContent);
      }
    }
  }, [instance, fileContent, mountWebContainer]);

  const handleChange = (newValue: string) => {
    if (!newValue) return;
    setText(newValue);
    (async () => {
      if (instance) {
        await writeIndexJS(instance, newValue);
      }
    })();
  };

  const resetContent = () => {
    const resetConfirm = window.prompt(
      'This will reset all code to default. Type "reset" to confirm.',
    );
    if (resetConfirm !== 'reset') return;
    protoStateService.send({
      type: 'UPDATE_FILE_CONTENT',
      fileContent: originalText,
    });
    (async () => {
      if (instance) {
        await writeIndexJS(instance, originalText);
      }
    })();
  };

  return {
    iframeRef,
    text,
    setText,
    handleChange,
    resetContent,
  };
}
