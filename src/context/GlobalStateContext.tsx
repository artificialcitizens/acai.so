import {
  appStateMachine,
  uiMachine,
  agentMachine,
  speechMachine,
} from '../state/';
import { ReactNode, createContext } from 'react';
import { useInterpret } from '@xstate/react';

export interface GlobalStateContextValue {
  appStateService: ReturnType<typeof useInterpret>;
  uiStateService: ReturnType<typeof useInterpret>;
  agentStateService: ReturnType<typeof useInterpret>;
  speechStateService: ReturnType<typeof useInterpret>;
}

export const GlobalStateContext = createContext<GlobalStateContextValue>(
  {} as GlobalStateContextValue,
);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const service = useInterpret(appStateMachine);
  const uiService = useInterpret(uiMachine);
  const agentService = useInterpret(agentMachine);
  const speechService = useInterpret(speechMachine);

  const value: GlobalStateContextValue = {
    appStateService: service,
    uiStateService: uiService,
    agentStateService: agentService,
    speechStateService: speechService,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};
