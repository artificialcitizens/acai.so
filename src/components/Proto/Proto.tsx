import { WebContainer } from '@webcontainer/api';
import { useEffect, useRef, useState } from 'react';
// import { files } from './express-server/files';
import { files } from './vite/files';

async function bootWebContainer() {
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
  await webcontainerInstance.spawn('yarn', ['run', 'start']);
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
  const [text, setText] = useState('');

  useEffect(() => {
    const mountWebContainer = async () => {
      await instance.mount(files);
      const exitcode = await installDependencies(instance);
      if (!iframeRef.current) throw new Error('iframe not found');
      startDevServer(instance, iframeRef.current);
      if (exitcode !== 0) {
        throw new Error('Failed to install dependencies');
      }
    };
    mountWebContainer();
    setText(files.src.directory['App.tsx'].file.contents);
  }, []);

  return (
    <div className="p-8 flex flex-col h-full w-full">
      <h1 className="text-2xl">WebContainer</h1>
      <section className="flex flex-col flex-grow w-full h-full">
        <iframe
          title="prototype view"
          ref={iframeRef}
          className="bg-acai-white max-h-50vh w-full"
          src=""
        ></iframe>
        <textarea
          ref={inputRef}
          className="bg-base flex-grow max-h-50vh"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            instance && writeIndexJS(instance, e.target.value);
          }}
        ></textarea>
      </section>
    </div>
  );
};

export default Proto;
