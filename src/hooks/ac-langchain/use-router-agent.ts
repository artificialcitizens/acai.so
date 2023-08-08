import { useContext, useEffect, useState } from 'react';
import useCookieStorage from '../use-cookie-storage';
import { avaChat } from '../../utils/ac-langchain/agents/ava';
import { toastifyAgentThought, toastifyError } from '../../components/Toast';
import { appStateMachine, handleCreateTab } from '../../state';
import { useInterpret } from '@xstate/react';
import { marked } from 'marked';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';

type AgentState = {
  mode: 'idle' | 'chat' | 'agent';
};

export const useAgent = (): {
  queryAgent: (message: string, systemMessage: string) => Promise<string>;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);

  const routeQuery = async (
    message: string,
    systemMessage: string,
  ): Promise<string> => {
    setLoading(true);
  };

  const queryAgent = async (
    message: string,
    systemMessage: string,
  ): Promise<string> => {
    setLoading(true);
    try {
      return response;
    } catch (error) {
      console.log({ error });
      toastifyError('Error fetching response');
      return 'I am not sure how to respond to that.';
    } finally {
      setLoading(false);
    }
  };

  return { queryAgent, loading };
};
