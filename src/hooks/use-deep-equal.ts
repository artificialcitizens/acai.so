import { useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';

export const useDeepCompare = (value: any) => {
  const ref = useRef();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};
