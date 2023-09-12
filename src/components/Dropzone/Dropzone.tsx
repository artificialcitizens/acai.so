import React, { useState, useCallback, ReactNode } from 'react';
import { slugify } from '../../utils/data-utils';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
interface DropzoneProps {
  children: ReactNode;
  onFilesDrop: (files: File[], name: string) => void;
}

export const getPdfText = async (
  pdf: any,
  filename: string,
): Promise<{ [filename: string]: { page: number; content: string }[] }> => {
  const numPages = pdf.numPages;
  const pageTextPromises = Array.from({ length: numPages }, async (_, i) => {
    const pageIndex = i + 1;
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const textItems = textContent.items
      .map((item: any) => ('str' in item ? item.str ?? '' : ''))
      .join(' ');
    return { page: pageIndex, content: textItems };
  });

  const pages = await Promise.all(pageTextPromises);
  return { [filename]: pages };
};

const Dropzone: React.FC<DropzoneProps> = ({ children, onFilesDrop }) => {
  const [highlight, setHighlight] = useState(false);

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
                  pdfjs
                    .getDocument(fileURL)
                    .promise.then((pdf) => {
                      getPdfText(pdf, slugify(file.name)).then((pdfData) => {
                        console.log({ pdfData });
                      });
                      // Process the PDF file using pdf object
                      // For example, you can get the number of pages using pdf.numPages
                      resolve(file);
                    })
                    .catch(reject);
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

      if (droppedFiles.length > 0) {
        const name = slugify(droppedFiles[0].name.split('.')[0]);
        onFilesDrop(droppedFiles, name);
      }
      setHighlight(false);
    },
    [onFilesDrop],
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
      className="flex flex-grow"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {children}
    </div>
  );
};

export default Dropzone;
