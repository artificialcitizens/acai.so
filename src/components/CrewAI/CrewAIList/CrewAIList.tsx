import { Agent, Task } from '../use-crew-ai';

const CrewAIList = ({
  getAgents,
  getTasks,
}: {
  getAgents: () => Agent[];
  getTasks: () => Task[];
}) => {
  const agents = getAgents();
  const tasks = getTasks();

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      <div className="m-2 border-b-2 border-solid border-dark text-acai-white flex flex-col">
        {agents.map((agent, index) => (
          <ul className="bg-base rounded-md p-4 mb-2" key={agent.role}>
            <li className="p-2">Role: {agent.role}</li>
            <li className="p-2">Goal: {agent.goal}</li>
            <li className="p-2">LLM: {agent.llm.model_name}</li>
            <li className="p-2">Tools: {agent.tools?.join('\n')}</li>
          </ul>
        ))}
      </div>
      <ul className="m-2 border-b-2 border-solid border-dark text-acai-white flex flex-col">
        {tasks.map((task, index) => (
          <ul key={index} className="p-4 bg-base mb-2 rounded-md">
            <li className="p-2">Description: {task.description}</li>
            <li className="p-2">Assigned Agent: {task.agent}</li>
            <li className="p-2">Tools: {task.tools?.join('\n')}</li>
            {/* Add more fields as needed */}
          </ul>
        ))}
      </ul>
    </div>
  );
};

export default CrewAIList;
