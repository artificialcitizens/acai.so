import React, { useState } from 'react';
import { Agent, useCrewAi } from '../use-crew-ai'; // Assuming you have a types file
import TextBox from '../../InlineEdit/TextBox';
import Dropdown from '../../InlineEdit/Dropdown';
import Checkbox from '../../InlineEdit/Checkbox';
import TextArea from '../../InlineEdit/TextArea';
import { toastifyInfo } from '../../Toast';

interface AgentCardProps {
  agent: Agent;
  crewId: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, crewId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { updateAgentInCrew, removeAgentFromCrew, tools, models, getFiles } =
    useCrewAi();
  const files = getFiles(crewId);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* <TextBox onCancel={() => {}} onSave={() => {}} value={agent.role} /> */}
      <ul className="bg-darker rounded-md p-4 mb-2" key={agent.role}>
        <li className="p-2">{agent.role}</li>
        {showDetails && (
          <>
            <li className="p-2">
              Role:
              <TextBox
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  updateAgentInCrew(crewId, { ...agent, role: value });
                }}
                value={agent.role}
              />
            </li>
            <li className="p-2">
              Name:
              <TextBox
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  updateAgentInCrew(crewId, { ...agent, name: value });
                }}
                value={agent.name}
              />
            </li>

            <li className="p-2">
              Goal:
              <TextArea
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  updateAgentInCrew(crewId, { ...agent, goal: value });
                }}
                value={agent.goal}
              />
            </li>
            <li className="p-2">
              Backstory:
              <TextArea
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  updateAgentInCrew(crewId, { ...agent, backstory: value });
                }}
                value={agent.backstory}
              />
            </li>
            <li className="p-2">
              Verbose:
              <input
                type="checkbox"
                checked={agent.verbose}
                onChange={() => {
                  updateAgentInCrew(crewId, {
                    ...agent,
                    verbose: !agent.verbose,
                  });
                }}
              />
            </li>
            <li className="p-2">
              Allow Delegation:
              <input
                type="checkbox"
                checked={agent.allow_delegation}
                onChange={() => {
                  updateAgentInCrew(crewId, {
                    ...agent,
                    allow_delegation: !agent.allow_delegation,
                  });
                }}
              />
            </li>
            <li className="p-2">
              Tools:
              <Checkbox
                options={
                  tools?.map((tool) => ({
                    label: tool,
                    value: tool,
                  })) || []
                }
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  alert(value);
                  updateAgentInCrew(crewId, { ...agent, tools: value });
                }}
                placeholder="Add tools"
              />
            </li>
            <li className="p-2">
              LLM:
              <Dropdown
                options={
                  models?.map((model) => ({
                    label: model,
                    value: model,
                  })) || []
                }
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  updateAgentInCrew(crewId, { ...agent, llm: value });
                }}
                placeholder="Select an LLM"
              />
            </li>
            {/* <li className="p-2">
              Files:
              <Checkbox
                options={
                  Object.entries(files).map(([key, value]) => ({
                    label: value.name,
                    value: value.id,
                  })) || []
                }
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  updateAgentInCrew(crewId, { ...agent, files: [value] });
                }}
                placeholder="Add file"
              />
            </li> */}
          </>
        )}
      </ul>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button className="mr-2" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Collapse' : 'Expand'}
        </button>
        <button
          onClick={() => {
            window.confirm(
              `Are you sure you wish to delete this agent? ID: ${agent.id}`,
            ) && removeAgentFromCrew(crewId, agent.id);
          }}
        >
          X
        </button>
      </div>
    </div>
  );
};
