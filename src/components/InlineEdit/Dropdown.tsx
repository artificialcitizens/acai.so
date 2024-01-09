import EasyEdit from 'react-easy-edit';

interface DropdownProps {
  options: { label: string; value: string }[];
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  instructions?: string;
  value?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSave,
  onCancel,
  placeholder,
  instructions,
  value,
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
      value={value}
    />
  );
};

export default Dropdown;
