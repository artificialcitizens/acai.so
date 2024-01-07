import React, { useState } from 'react';
import { Agent } from '../use-crew-ai'; // Assuming you have a types file

interface AgentCardProps {
  agent: Agent;
  // deleteAgent: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ul className="bg-darker rounded-md p-4 mb-2" key={agent.role}>
        <li className="p-2">Name: {agent.role}</li>
        {showDetails && (
          <>
            <li className="p-2">Role: {agent.role}</li>
            <li className="p-2">Goal: {agent.goal}</li>
            <li className="p-2">LLM: {agent.llm.model_name}</li>
            <li className="p-2">Tools: {agent.tools?.join('|')}</li>
          </>
        )}
      </ul>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button className="mr-2" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'x' : '...'}
        </button>
        {/* <button
          onClick={() => {
            window.confirm(
              `Are you sure you wish to delete this agent? ID: ${agent.id}`,
            ) && deleteAgent(agent.id);
          }}
        >
          X
        </button> */}
      </div>
    </div>
  );
};
