import EasyEdit from 'react-easy-edit';

interface CheckBoxProps {
  options: { label: string; value: string }[];
  onSave: (value: string[]) => void;
  onCancel: () => void;
  placeholder?: string;
  instructions?: string;
}

const Checkbox: React.FC<CheckBoxProps> = ({
  options,
  onSave,
  onCancel,
  placeholder,
  instructions,
}) => {
  return (
    <EasyEdit
      type="checkbox"
      options={options}
      onSave={onSave}
      onCancel={onCancel}
      placeholder={placeholder || 'Click to edit'}
      instructions={instructions || ''}
      saveButtonLabel="Save"
      cancelButtonLabel="Cancel"
    />
  );
};

export default Checkbox;
