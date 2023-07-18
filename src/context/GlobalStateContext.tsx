import React, { createContext } from 'react';
import { useInterpret } from '@xstate/react';

import { appStateMachine } from '../state';
import { InterpreterFrom } from 'xstate/lib/types';

createContext({ appStateService: {} as InterpreterFrom<typeof appStateMachine> });

export const GlobalStateContext = createContext({});

export const GlobalStateProvider = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}) => {
  const appStateService = useInterpret(appStateMachine);

  return <GlobalStateContext.Provider value={{ appStateService }}>{props.children}</GlobalStateContext.Provider>;
};
