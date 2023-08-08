import { useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

const useElementPosition = (
  initialElementSelector: string,
): [Position, (newSelector: string) => void, string] => {
  const [elementSelector, setElementSelector] = useState(
    initialElementSelector,
  );
  const [elementPosition, setElementPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const updatePosition = useCallback(() => {
    const element = document.querySelector(elementSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const cursorRadius = 6; // Half of cursor's width/height (0.75rem = 12px, so radius is 6px)
      setElementPosition({
        x: rect.left + rect.width / 2 - cursorRadius, // Adjust to center of element
        y: rect.top + rect.height / 2 - cursorRadius, // Adjust to center of element
      });
    }
  }, [elementSelector]);

  useEffect(() => {
    updatePosition();
    // Set up a mutation observer to watch for changes in the DOM
    const observer = new MutationObserver(updatePosition);
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [updatePosition]);

  const updateElementSelector = useCallback((newSelector: string) => {
    setElementSelector(newSelector);
  }, []);

  const regex = /\[data-ava-element='(.*?)'\]/;
  const match = elementSelector.match(regex);
  const elementValue = match ? match[1] : '';

  return [elementPosition, updateElementSelector, elementValue];
};

export default useElementPosition;
