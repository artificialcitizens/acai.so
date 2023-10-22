import {
  appStateMachine,
  uiMachine,
  agentMachine,
  speechMachine,
  UIContext,
  AC_UIEvent,
  AgentContext,
  AgentEvent,
  SpeechContext,
  SpeechEvent,
  AppContext,
  AppEvent,
} from '../state/';
import { ReactNode, createContext } from 'react';
import { useInterpret } from '@xstate/react';
import { Interpreter } from 'xstate';

export interface GlobalStateContextValue {
  appStateService: Interpreter<
    AppContext,
    any,
    AppEvent,
    { value: any; context: AppContext }, // replace State<AppContext, AppEvent> with { value: any; context: AppContext; }
    any
  >;
  uiStateService: Interpreter<
    UIContext,
    any,
    AC_UIEvent,
    { value: any; context: UIContext }, // replace State<UIContext, AC_UIEvent> with { value: any; context: UIContext; }
    any
  >;
  agentStateService: Interpreter<
    AgentContext,
    any,
    AgentEvent,
    { value: any; context: AgentContext }, // replace State<AgentWorkspace, AgentEvent> with { value: any; context: AgentWorkspace; }
    any
  >;
  speechStateService: Interpreter<
    SpeechContext,
    any,
    SpeechEvent,
    { value: any; context: SpeechContext }, // replace State<SpeechContext, SpeechEvent> with { value: any; context: SpeechContext; }
    any
  >;
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
