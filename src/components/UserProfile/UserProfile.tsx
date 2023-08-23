import React, { useEffect, FormEvent, useState, useMemo } from 'react';
import { toastifyInfo } from '../Toast';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

const UserProfile: React.FC = () => {
  const [name, setName] = useLocalStorageKeyValue('USER_NAME', '');
  const [location, setLocation] = useLocalStorageKeyValue('USER_LOCATION', '');

  const fields = useMemo(
    () => [
      {
        id: 'USER_NAME',
        name: 'Name',
        value: name,
        setValue: setName,
      },
      {
        id: 'USER_LOCATION',
        name: 'Location',
        value: location,
        setValue: setLocation,
      },
    ],
    [name, location, setName, setLocation],
  );

  const [values, setValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const newValues: { [key: string]: string } = {};
    fields.forEach(({ id, value }) => {
      if (value) {
        newValues[id] = value;
      }
    });
    setValues(newValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, location]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    fields.forEach(({ id, setValue }) => {
      setValue(values[id]);
    });
    toastifyInfo('User profile saved');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {fields.map(({ id, name }) => (
        <span className="flex mb-2 items-center" key={id}>
          <label className="text-acai-white pr-2 w-[50%]">{name}:</label>
          <input
            className="text-acai-white bg-base px-[2px]"
            type="text"
            value={values[id] || ''}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
          />
        </span>
      ))}
    </form>
  );
};

export default UserProfile;
