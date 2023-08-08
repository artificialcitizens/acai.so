import { useState, useEffect } from 'react';

const useAvaElements = (): string[] => {
  const [elements, setElements] = useState<string[]>([]);

  useEffect(() => {
    const avaElements = document.querySelectorAll('[data-ava-element]');
    const elementValues = Array.from(avaElements).map(
      (element) => element.getAttribute('data-ava-element') || '',
    );
    setElements(elementValues);
  }, []);

  return elements;
};

export default useAvaElements;
