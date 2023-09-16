import React, { useState, useCallback, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastifyError } from '../../Toast';
import { Tab, handleCreateTab } from '../../../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../../context/GlobalStateContext';

interface DropzoneProps {
  children?: ReactNode;
  activeTab: boolean;
  workspaceId: string;
  onFilesDrop: (file: File) => void;
  onPDFDrop: (file: File) => void;
}

const DropFileSection: React.FC<{
  highlight: boolean;
  handleCreateNewDocument: () => void;
}> = ({ highlight, handleCreateNewDocument }) => (
  <div
    className={`w-full h-full flex flex-col justify-center items-center ${
      highlight ? 'bg-dark-200' : 'bg-darker'
    }`}
  >
    <div className="text-acai-white">
      Drop a file to upload{' '}
      <span className="">
        or
        <button className="link mx-1" onClick={handleCreateNewDocument}>
          create
        </button>
        a new document
      </span>
    </div>
  </div>
);

const EditorDropzone: React.FC<DropzoneProps> = ({
  children,
  onFilesDrop,
  onPDFDrop,
  workspaceId,
  activeTab,
}) => {
  const [highlight, setHighlight] = useState(false);
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const navigate = useNavigate();

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const items = event.dataTransfer.items;
      const droppedFiles: File[] = [];

      const processEntry = (entry: any): Promise<File[] | File | undefined> => {
        if (entry.isFile) {
          return new Promise<File>((resolve, reject) => {
            entry.file((file: File | PromiseLike<File>) => {
              if (file instanceof File) {
                const fileExtension = file.name.split('.').pop();
                switch (fileExtension) {
                  case 'pdf': {
                    onPDFDrop(file);
                    resolve(file);
                    break;
                  }
                  case 'txt':
                  case 'md': {
                    onFilesDrop(file);
                    resolve(file);
                    break;
                  }
                  default:
                    toastifyError('Must be a .pdf, .txt, or .md file');
                    break;
                }
              }
            });
          });
        } else if (entry.isDirectory) {
          return readDirectory(entry.createReader());
        }
        return Promise.resolve(undefined);
      };

      const readDirectory = async (
        reader: any,
      ): Promise<File[] | undefined> => {
        const entries = await readEntries(reader);
        const folderFiles: File[] = [];

        for (const entry of entries) {
          const fileOrFiles = await processEntry(entry);
          if (Array.isArray(fileOrFiles)) {
            folderFiles.push(...fileOrFiles);
          } else {
            if (fileOrFiles) folderFiles.push(fileOrFiles);
          }
        }

        return folderFiles.length > 0 ? folderFiles : undefined;
      };

      const readEntries = (reader: any): Promise<any[]> => {
        return new Promise<any[]>((resolve) => {
          reader.readEntries((entries: any[] | PromiseLike<any[]>) =>
            resolve(entries),
          );
        });
      };

      for (const item of items) {
        if (item.kind === 'file') {
          const fileOrFiles = await processEntry(item.webkitGetAsEntry());
          if (Array.isArray(fileOrFiles)) {
            droppedFiles.push(
              ...fileOrFiles.filter((file) => file.type !== ''),
            );
          } else {
            if (fileOrFiles && fileOrFiles.type !== '')
              droppedFiles.push(fileOrFiles);
          }
        }
      }

      // if (droppedFiles.length > 0) {
      //   const name = slugify(droppedFiles[0].name.split('.')[0]);
      //   onFilesDrop(droppedFiles, name);
      // }
      setHighlight(false);
    },
    [onFilesDrop, onPDFDrop],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setHighlight(true);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setHighlight(false);
  }, []);

  const handleCreateNewDocument = async () => {
    const title = prompt('Enter a title for your new document');
    if (!title) {
      toastifyError('Must enter a title');
      return;
    }
    handleCreateTab({ title, content: '' }, workspaceId).then((tab: Tab) => {
      globalServices.appStateService.send({
        type: 'ADD_TAB',
        tab,
      });
      setTimeout(() => {
        navigate(`/${workspaceId}/documents/${tab.id}`);
      }, 250);
    });
  };

  return (
    <div
      className="w-full h-full flex-grow max-h-[calc(100vh-2rem)]"
      id="editor-dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {!activeTab || highlight ? (
        <DropFileSection
          highlight={highlight}
          handleCreateNewDocument={handleCreateNewDocument}
        />
      ) : (
        children
      )}
    </div>
  );
};

export default EditorDropzone;
