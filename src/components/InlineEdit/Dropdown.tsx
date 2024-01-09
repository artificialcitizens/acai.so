import EasyEdit from 'react-easy-edit';

interface DropdownProps {
  options: { label: string; value: string }[];
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  instructions?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSave,
  onCancel,
  placeholder,
  instructions,
}) => {
  return (
    <EasyEdit
      type="select"
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

export default Dropdown;
