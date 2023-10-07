import { useState, useEffect } from 'react';

const useLocationManager = () => {
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedLocation = localStorage.getItem('location');
    setLocation(storedLocation);
    setIsLoading(false);
  }, []);

  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    localStorage.setItem('location', newLocation);
  };

  return { location, isLoading, updateLocation };
};

export default useLocationManager;
