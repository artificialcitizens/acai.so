import { Agent, Llm, Task } from '../use-crew-ai';

const CrewAICard = ({
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
      {/* <ul>
        {llmInfo.map((llm, index) => (
          <li key={index}>
            Base URL: {llm.base_url}, Model Name: {llm.model_name}, OpenAI API
            Key: {llm.openai_api_key}
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default CrewAICard;
