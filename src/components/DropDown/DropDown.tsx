import React, { ChangeEvent } from 'react';

type Option = {
  value: string;
  label: string;
};

type DropDownProps = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export const Dropdown: React.FC<DropDownProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col mb-2 flex-grow mr-2`}>
      <label className="ml-1 mb-2 font-medium text-xs text-light">
        {label}
      </label>
      <select
        className="px-3 py-2 text-light bg-darker border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
        value={value}
        onChange={handleSelectChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
