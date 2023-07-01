import React, { createContext } from 'react';
import { useMachine } from '@xstate/react';
import { appStateMachine, userStateMachine } from '../machines';

const AppStateContext = createContext<any | null>(null);
const UserStateContext = createContext<any | null>(null);

interface StateProviderProps {
  children: React.ReactNode;
}

const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const [appState, appSend] = useMachine(appStateMachine);
  const [userState, userSend] = useMachine(userStateMachine);

  return (
    <AppStateContext.Provider value={{ state: appState, send: appSend }}>
      <UserStateContext.Provider value={{ state: userState, send: userSend }}>{children}</UserStateContext.Provider>
    </AppStateContext.Provider>
  );
};

export { AppStateContext, UserStateContext, StateProvider };
