import { appStateMachine } from '../state/';
import { ReactNode, createContext } from 'react';
import { useInterpret } from '@xstate/react';

export interface GlobalStateContextValue {
  appStateService: ReturnType<typeof useInterpret>;
}

export const GlobalStateContext = createContext<GlobalStateContextValue>({} as GlobalStateContextValue);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const service = useInterpret(appStateMachine);

  const value: GlobalStateContextValue = {
    appStateService: service,
  };

  return <GlobalStateContext.Provider value={value}>{children}</GlobalStateContext.Provider>;
};
