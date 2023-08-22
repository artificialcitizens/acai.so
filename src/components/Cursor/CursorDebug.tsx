import React, { useState, useCallback } from 'react';
import useAvaElements from '../../hooks/use-ava-elements';

interface CursorDebugProps {
  onSubmit: (elementSelector: string) => void;
}

const CursorDebug: React.FC<CursorDebugProps> = ({ onSubmit }) => {
  const [selectedElement, setSelectedElement] = useState('');
  const avaElements = useAvaElements();

  const handleSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedElement(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit(`[data-ava-element='${selectedElement}']`);
    },
    [selectedElement, onSubmit],
  );

  return (
    <form className="text-acai-white" onSubmit={handleSubmit}>
      <select value={selectedElement} onChange={handleSelectChange}>
        <option value="">Select an element</option>
        {avaElements.map((element, index) => (
          <option key={index} value={element}>
            {element}
          </option>
        ))}
      </select>
      <button className="text-acai-white" type="submit">
        Update Cursor Position
      </button>
    </form>
  );
};
export default CursorDebug;
