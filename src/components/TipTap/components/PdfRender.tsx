import React, { useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFRendererProps {
  fileUrl: string;
  startingPage?: number;
}

const PDFRenderer: React.FC<PDFRendererProps> = ({ fileUrl, startingPage }) => {
  const [numPages, setNumPages] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(startingPage || 1);
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    setPageNumber(startingPage || 1);
  }, [startingPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const zoomIn = () => {
    setScale(scale + 0.1);
  };

  const zoomOut = () => {
    if (scale > 0.1) {
      setScale(scale - 0.1);
    }
  };

  return (
    <div className="flex relative flex-col h-full w-full">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex-grow max-w-[calc(100vw-30rem)]"
      >
        <Page
          className="max-h-[calc(100vh-3rem)] max-w-[calc(100vw-30rem)] overflow-scroll justify-items-center flex flex-col m-auto items-center"
          pageNumber={pageNumber}
          renderTextLayer={false}
          scale={scale}
        />
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
