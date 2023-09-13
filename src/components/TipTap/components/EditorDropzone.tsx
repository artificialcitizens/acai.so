import React, { useState, useCallback, ReactNode } from 'react';
import { slugify } from '../../../utils/data-utils';
import PDFRenderer from './PdfRender';

interface DropzoneProps {
  children?: ReactNode;
  onFilesDrop?: (files: File[], name: string) => void;
}

const EditorDropzone: React.FC<DropzoneProps> = ({ children, onFilesDrop }) => {
  const [highlight, setHighlight] = useState(false);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);

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
                if (file.type === 'application/pdf') {
                  const fileURL = URL.createObjectURL(file);
                  setFileUrl(fileURL);
                } else {
                  resolve(file);
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
    [],
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

  return (
    <div
      className="w-full h-full"
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
          <div className="text-acai-white">Drop a file to upload</div>
        </div>
      )}
      {fileUrl && <PDFRenderer fileUrl={fileUrl} />}
      {/* {children} */}
    </div>
  );
};

export default EditorDropzone;
