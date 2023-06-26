import React, { useState, useCallback, ReactNode } from 'react';

interface DropzoneProps {
  children: ReactNode;
  onFileDrop: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ children, onFileDrop }) => {
  const [highlight, setHighlight] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const droppedFile = files[0];
        onFileDrop(droppedFile);
      }
      setHighlight(false);
    },
    [onFileDrop],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHighlight(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setHighlight(false);
  }, []);

  return (
    <div className="h-full" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      {children}
    </div>
  );
};

export default Dropzone;
