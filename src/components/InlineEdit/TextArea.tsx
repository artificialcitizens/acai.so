import React from 'react';
import EasyEdit from 'react-easy-edit';

interface TextBoxProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}
const TextBox: React.FC<TextBoxProps> = ({ onCancel, onSave, value }) => {
  return (
    <EasyEdit
      type="textarea"
      value={value}
      onSave={onSave}
      onCancel={onCancel}
      saveButtonLabel="Save"
      cancelButtonLabel="Cancel"
      attributes={{ name: 'awesome-input', id: 1 }}
    />
  );
};

export default TextBox;
