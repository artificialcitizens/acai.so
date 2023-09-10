import React, { useContext, useEffect, useState } from 'react';
import { getOpenAIChatModels } from '../../lib/ac-langchain/models/getOpenAIModels';
import Dropdown from '../DropDown/';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useActor } from '@xstate/react';
import { agentMode } from '../Ava/use-ava';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

interface ChatModelProps {
  workspaceId: string;
}

export const ChatModelDropdown: React.FC<ChatModelProps> = ({
  workspaceId,
}) => {
  const [openAIModels, setOpenAIModels] = useState<string[]>([]);
  const [openAIKey] = useLocalStorageKeyValue(
    'OPENAI_KEY',
    import.meta.env.VITE_OPENAI_KEY || '',
  );

  useEffect(() => {
    getOpenAIChatModels().then((res) => {
      setOpenAIModels(res);
    });
  }, [openAIKey]); // Add openAIKey as a dependency
  const { agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [state, send] = useActor(agentStateService);

  const handleModelChange = (modelName: string) => {
    send({
      type: 'SET_OPENAI_CHAT_MODEL',
      workspaceId,
      modelName,
    });
  };

  const handleModeChange = (mode: string) => {
    send({
      type: 'SET_AGENT_MODE',
      workspaceId,
      mode,
    });
  };
  const handleRagStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    send({
      type: 'SET_RAG_RESULTS',
      workspaceId,
      returnResults: event.target.checked,
    });
  };
  return (
    <span className="flex flex-col justify-between">
      <Dropdown
        label="Agent Mode"
        options={agentMode.map((mode) => ({ value: mode, label: mode }))}
        value={state.context[workspaceId]?.agentMode || ''}
        onChange={handleModeChange}
      />
      {state.context[workspaceId]?.agentMode === 'chat' && (
        <Dropdown
          label="Chat Model"
          options={openAIModels.map((model) => ({
            value: model,
            label: model,
          }))}
          value={state.context[workspaceId]?.openAIChatModel || ''}
          onChange={handleModelChange}
        />
      )}
      {state.context[workspaceId]?.agentMode === 'rag' && (
        <div className="mt-2">
          <label className="inline-flex items-center text-acai-white">
            <span className="mx-2">Return Results</span>
            <input
              type="checkbox"
              className="form-checkbox"
              checked={state.context[workspaceId]?.returnRagResults}
              onChange={handleRagStateChange}
            />
          </label>
        </div>
      )}
    </span>
  );
};
