import React, { useContext, useEffect, useState } from 'react';
import { getOpenAIChatModels } from '../../utils/ac-langchain/models/getOpenAIModels';
import Dropdown from '../DropDown/';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useActor } from '@xstate/react';
import { agentMode } from '../../state';

interface ChatModelProps {
  workspaceId: string;
}

export const ChatModelDropdown: React.FC<ChatModelProps> = ({
  workspaceId,
}) => {
  const [openAIModels, setOpenAIModels] = useState<string[]>([]);

  useEffect(() => {
    getOpenAIChatModels().then((res) => {
      setOpenAIModels(res);
    });
  }, []);

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

  return (
    <span className="flex justify-between">
      <Dropdown
        label="Chat Model"
        options={openAIModels.map((model) => ({ value: model, label: model }))}
        value={state.context[workspaceId]?.openAIChatModel || ''}
        onChange={handleModelChange}
      />

      <Dropdown
        label="Agent Mode"
        options={agentMode.map((mode) => ({ value: mode, label: mode }))}
        value={state.context[workspaceId]?.agentMode || ''}
        onChange={handleModeChange}
      />
    </span>
  );
};
