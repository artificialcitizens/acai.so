import React, { useEffect, FormEvent, useState, useMemo } from 'react';
import { toastifyInfo } from '../Toast';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

const UserProfile: React.FC = () => {
  const [name, setName] = useLocalStorageKeyValue('USER_NAME', '');
  const [location, setLocation] = useLocalStorageKeyValue('USER_LOCATION', '');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setName(name);
    setLocation(location);
    toastifyInfo('User profile saved');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex mb-2 items-center">
        <label htmlFor="userName" className="text-acai-white pr-2 w-[50%]">
          Name:
        </label>
        <input
          id="userName"
          className="text-acai-white bg-base px-[2px]"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex mb-2 items-center">
        <label htmlFor="userLocation" className="text-acai-white pr-2 w-[50%]">
          Location:
        </label>
        <input
          id="userLocation"
          className="text-acai-white bg-base px-[2px]"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default UserProfile;
