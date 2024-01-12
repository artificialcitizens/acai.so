import React, { useEffect, useState } from 'react';
import { Task, useCrewAi } from '../use-crew-ai'; // Assuming you have a types file
import TextBox from '../../InlineEdit/TextBox';
import Checkbox from '../../InlineEdit/Checkbox';
import Dropdown from '../../InlineEdit/Dropdown';
import { toastifyInfo } from '../../Toast';

interface TaskCardProps {
  task: Task;
  crewId: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, crewId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { crews, updateTaskInCrew, removeTaskFromCrew, tools, getFiles } =
    useCrewAi();
  const [agentRoles, setAgentRoles] = useState<string[]>([]);
  const files = getFiles(crewId);

  useEffect(() => {
    if (!crews) return;
    const crew = crews.find((crew) => crew.id === crewId);
    if (crew) {
      setAgentRoles(crew.agents.map((agent) => agent.role));
    }
  }, [crews, crewId]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ul className="bg-darker rounded-md p-4 mb-2" key={task.id}>
        <li className="p-2">{task.name}</li>
        {showDetails && (
          <>
            <li className="p-2">
              Name:
              <TextBox
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  if (!value) {
                    toastifyInfo('Task name cannot be empty');
                    return;
                  }
                  updateTaskInCrew(crewId, { ...task, name: value });
                }}
                value={task.name}
              />
            </li>
            <li className="p-2">
              Description:
              <TextBox
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  if (!value) {
                    toastifyInfo('Task description cannot be empty');
                    return;
                  }
                  updateTaskInCrew(crewId, { ...task, description: value });
                }}
                value={task.description}
              />
            </li>
            <li className="p-2">
              Agent:
              <Dropdown
                options={
                  agentRoles?.map((role) => ({
                    label: role,
                    value: role,
                  })) || []
                }
                onCancel={() => {
                  console.log('cancel');
                }}
                onSave={(value) => {
                  if (!value) {
                    toastifyInfo('Task agent cannot be empty');
                    return;
                  }
                  updateTaskInCrew(crewId, { ...task, agent: value });
                }}
                placeholder="Select an Agent"
                value={agentRoles?.find((role) => role === task.agent)}
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
                  if (!value) {
                    return;
                  }
                  updateTaskInCrew(crewId, { ...task, tools: value });
                }}
                placeholder="Add tools"
                //if task.tools is undefined, don't render value
                value={task.tools}
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
                  updateTaskInCrew(crewId, { ...task, files: [value] });
                }}
                placeholder="Select files"
              />
            </li> */}
          </>
        )}
      </ul>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button className="mr-1" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Collapse' : 'Expand'}
        </button>
        <button
          onClick={() => {
            window.confirm('Are you sure you want to delete this Task?') &&
              removeTaskFromCrew(crewId, task.id);
          }}
        >
          X
        </button>
      </div>
    </div>
  );
};
