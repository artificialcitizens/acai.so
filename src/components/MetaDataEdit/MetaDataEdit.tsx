import React, { useState } from 'react';

type Metadata = Record<string, any>;

interface FormProps {
  metadata: Metadata;
  onSubmit: (formData: Metadata) => void;
}

const MetaDataEdit: React.FC<FormProps> = ({ metadata, onSubmit }) => {
  const [formData, setFormData] = useState<Metadata>(metadata);

  const handleChange = (key: string, value: string | number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (oldKey !== newKey) {
      setFormData((prevFormData) => {
        const updatedFormData = { ...prevFormData };
        const value = updatedFormData[oldKey];
        delete updatedFormData[oldKey];
        updatedFormData[newKey] = value;
        return updatedFormData;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderFormFields = () => {
    return Object.entries(formData).map(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return (
          <div key={key}>
            <label htmlFor={`${key}-key`}>Key</label>
            <input
              type="text"
              id={`${key}-key`}
              value={key}
              onChange={(e) => handleKeyChange(key, e.target.value)}
            />
            <label htmlFor={key}>Value</label>
            <input
              type="text"
              id={key}
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        );
      }
      return null;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderFormFields()}
      <button type="submit">Submit</button>
    </form>
  );
};

export default MetaDataEdit;
