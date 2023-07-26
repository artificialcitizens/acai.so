import { useState, useEffect } from 'react';

export const useHighlightedText = () => {
  const [highlightedText, setHighlightedText] = useState('');

  useEffect(() => {
    const handleHighlight = () => {
      const selectedText = window.getSelection()?.toString();
      if (!selectedText) return;
      setHighlightedText(selectedText);
    };

    document.addEventListener('mouseup', handleHighlight);

    return () => {
      document.removeEventListener('mouseup', handleHighlight);
    };
  }, []);

  return highlightedText;
};
