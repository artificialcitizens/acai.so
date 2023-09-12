import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFRendererProps {
  fileUrl: string;
}

// @TODO: create ability to pass in a page number to render, go to last page if page number is greater than total pages
const PDFRenderer: React.FC<PDFRendererProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col h-full">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex-grow"
      >
        <Page
          className="max-h-[90vh] max-w-min overflow-scroll m-auto"
          pageNumber={pageNumber}
        />
      </Document>
      <div className="flex w-1/4 m-auto justify-around">
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((prevPageNumber) => prevPageNumber - 1)}
        >
          {'<'}
        </button>
        <p>
          {pageNumber}/{numPages}
        </p>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber((prevPageNumber) => prevPageNumber + 1)}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default PDFRenderer;
