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
    <div>
      <ul>
        {agents.map((agent, index) => (
          <li key={index}>
            Role: {agent.role}, Goal: {agent.goal}
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            Description: {task.description}, Agent: {task.agent}
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrewAIList;
