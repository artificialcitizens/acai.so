import React, { useContext, useEffect, useState } from 'react';
import { getOpenAIChatModels } from '../../utils/ac-langchain/models/getOpenAIModels';
import AvaDropdown from '../DropDown';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useActor } from '@xstate/react';
import { Dropdown } from 'flowbite-react';
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
  // subscribe to agent state with useActor hook
  const [state, send] = useActor(agentStateService);
  return (
    <>
      <AvaDropdown inline label="OpenAI Chat Model">
        {openAIModels.map((modelName) => (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <Dropdown.Item
            key={modelName}
            onClick={() => {
              send({
                type: 'SET_OPENAI_CHAT_MODEL',
                workspaceId,
                modelName,
              });
            }}
            onKeyDown={() => {
              send({
                type: 'SET_OPENAI_CHAT_MODEL',
                workspaceId,
                modelName,
              });
            }}
          >
            {modelName}
          </Dropdown.Item>
        ))}
      </AvaDropdown>
      <p>current: {state.context[workspaceId].openAIChatModel}</p>
      <AvaDropdown inline label="Agent Mode">
        {agentMode.map((mode) => (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <Dropdown.Item
            key={mode}
            onClick={() => {
              send({
                type: 'SET_AGENT_MODE',
                workspaceId,
                mode,
              });
            }}
            onKeyDown={() => {
              send({
                type: 'SET_AGENT_MODE',
                workspaceId,
                mode,
              });
            }}
          >
            {mode}
          </Dropdown.Item>
        ))}
      </AvaDropdown>
      <p>current: {state.context[workspaceId].agentMode}</p>
    </>
  );
};
