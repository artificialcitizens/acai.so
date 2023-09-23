import {
  appStateMachine,
  uiMachine,
  agentMachine,
  protoMachine,
} from '../state/';
import { ReactNode, createContext } from 'react';
import { useInterpret } from '@xstate/react';

export interface GlobalStateContextValue {
  appStateService: ReturnType<typeof useInterpret>;
  uiStateService: ReturnType<typeof useInterpret>;
  agentStateService: ReturnType<typeof useInterpret>;
  protoStateService: ReturnType<typeof useInterpret>;
}

export const GlobalStateContext = createContext<GlobalStateContextValue>(
  {} as GlobalStateContextValue,
);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const service = useInterpret(appStateMachine);
  const uiService = useInterpret(uiMachine);
  const agentService = useInterpret(agentMachine);
  const protoService = useInterpret(protoMachine);

  const value: GlobalStateContextValue = {
    appStateService: service,
    uiStateService: uiService,
    agentStateService: agentService,
    protoStateService: protoService,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};
