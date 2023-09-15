import React, { useState, useCallback, ReactNode, useContext } from 'react';
import { readFileAsText, slugify } from '../../../utils/data-utils';
import PDFRenderer from '../../PDFRenderer/PdfRender';
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
  onFilesDrop?: (files: File[], name: string) => void;
}

const EditorDropzone: React.FC<DropzoneProps> = ({
  children,
  onFilesDrop,
  workspaceId,
  activeTab,
}) => {
  const [highlight, setHighlight] = useState(false);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
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
                    const fileURL = URL.createObjectURL(file);
                    navigate(`/${workspaceId}/temp/${slugify(file.name)}/`);
                    setFileUrl(fileURL);
                    resolve(file);
                    break;
                  }
                  case 'txt':
                  case 'md': {
                    const title = file.name.split('.')[0];
                    readFileAsText(file, fileExtension).then((content) => {
                      handleCreateTab({ title, content }, workspaceId).then(
                        (tab: Tab) => {
                          globalServices.appStateService.send({
                            type: 'ADD_TAB',
                            tab,
                          });
                          setTimeout(() => {
                            navigate(`/${workspaceId}/${tab.id}`);
                          }, 250);
                          resolve(file);
                        },
                      );
                    });
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
    [globalServices.appStateService, navigate, workspaceId],
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
        navigate(`/${workspaceId}/${tab.id}`);
      }, 250);
    });
  };

  // @TODO - clean up this spaghetti code and move it to an overall editor component
  return activeTab && !highlight ? (
    <div
      className="w-full h-full flex-grow max-h-[calc(100vh-2rem)]"
      id="editor-dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {children}
    </div>
  ) : (
    <div
      className="w-full h-full flex-grow max-h-[calc(100vh-2rem)]"
      id="editor-dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {!fileUrl && (
        <div
          className={`w-full h-full flex flex-col justify-center items-center ${
            highlight ? 'bg-dark-200' : 'bg-darker'
          }`}
        >
          <div className="text-4xl text-acai-white">
            <i className="fas fa-file-upload"></i>
          </div>
          <div className="text-acai-white">
            Drop a file to upload{' '}
            {!highlight && (
              <>
                <span className="">
                  or
                  <button
                    className="link mx-1"
                    onClick={handleCreateNewDocument}
                  >
                    create
                  </button>
                  a new document
                </span>
              </>
            )}
          </div>
        </div>
      )}
      {fileUrl && <PDFRenderer fileUrl={fileUrl} />}
    </div>
  );
};

export default EditorDropzone;
