import React, { useState, useEffect } from 'react';

const StorageMeter: React.FC = () => {
  const [storage, setStorage] = useState({ used: 0, total: 0 });

  useEffect(() => {
    const calculateStorage = () => {
      let total = 0;
      let used = 0;

      for (const x in localStorage) {
        const amount = (localStorage[x].length * 2) / 1024 / 1024;
        if (
          !isNaN(amount) &&
          Object.prototype.hasOwnProperty.call(localStorage, x)
        ) {
          total += amount;
        }
      }
      used = total;
      total = 5 * 1024; // 5MB is the default storage limit in most modern browsers
      setStorage({ used, total });
    };

    calculateStorage();
  }, []);

  const storagePercentage = (storage.used / storage.total) * 100;

  return (
    <div className="text-light">
      <meter value={storage.used} max={storage.total}></meter>
      <p>{storagePercentage.toFixed(2)}% storage used</p>
    </div>
  );
};

export default StorageMeter;
