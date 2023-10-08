import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFRendererProps {
  startingPage: number;
  fileUrl: string;
  onUpload?: (file: File) => void;
}

const PDFRenderer: React.FC<PDFRendererProps> = ({ startingPage, fileUrl }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(startingPage || 1);
  const [scale, setScale] = useState(1.5);
  const [isDragging, setIsDragging] = useState(false);
  const { page } = useParams<{ page: string }>();

  useEffect(() => {
    if (!page) return;
    setPageNumber(Number(page));
  }, [page]);

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleStop = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    setPageNumber(startingPage || 1);
  }, [startingPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(startingPage || 1);
  };

  const zoomIn = () => {
    setScale(scale + 0.1);
  };

  const zoomOut = () => {
    if (scale > 0.1) {
      setScale(scale - 0.1);
    }
  };

  const dragRef = useRef(null);

  return (
    <div className="flex relative flex-col h-full w-full">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex-grow max-w-[calc(100vw-30rem)]"
      >
        <Draggable onStart={handleStart} onStop={handleStop}>
          <div
            ref={dragRef}
            style={{ cursor: isDragging ? 'grab' : 'inherit' }}
          >
            <Page
              className="max-h-[calc(100vh-3rem)] max-w-[calc(100vw-30rem)] justify-items-center flex flex-col m-auto items-center"
              pageNumber={pageNumber}
              renderTextLayer={false}
              scale={scale}
            />
          </div>
        </Draggable>
      </Document>
      <div className="w-full h-full relative">
        <div className="flex w-1/2 md:w-1/3 max-w-72 m-auto fixed justify-around z-100 bg-dark bg-opacity-75 shadow-lg p-2 rounded-2xl bottom-4 right-1/2">
          <button
            className="font-bold disabled:cursor-not-allowed"
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(1)}
          >
            {'<<'}
          </button>
          <button
            className="font-bold disabled:cursor-not-allowed"
            type="button"
            disabled={pageNumber <= 1}
            onClick={() =>
              setPageNumber((prevPageNumber) => prevPageNumber - 1)
            }
          >
            {'<'}
          </button>
          <p className="font-medium">
            {pageNumber}/{numPages}
          </p>
          <button
            className="font-bold disabled:cursor-not-allowed"
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() =>
              setPageNumber((prevPageNumber) => prevPageNumber + 1)
            }
          >
            {'>'}
          </button>
          <button
            className="font-bold disabled:cursor-not-allowed"
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(numPages - 1)}
          >
            {'>>'}
          </button>
          <button onClick={zoomOut}>-</button>
          <button onClick={zoomIn}>+</button>
        </div>
      </div>
    </div>
  );
};

export default PDFRenderer;
