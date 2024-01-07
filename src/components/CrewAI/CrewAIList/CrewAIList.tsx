import { useState } from 'react';
import { AgentCard } from '../AgentCard';
import { TaskCard } from '../TaskCard';
import { Agent, Crew, Task } from '../use-crew-ai';
import { v4 as uuidv4 } from 'uuid';
import AgentForm from '../AgentCard/AgentForm';

const CrewAIList = ({
  config,
}: // addAgent,
// addTask,
// deleteAgent,
// deleteTask,
// updateAgent,
// updateTask,
{
  config: Crew;
  // addAgent: (agent: Agent) => void;
  // addTask: (task: Task) => void;
  // deleteAgent: (agentId: string) => void;
  // deleteTask: (taskId: string) => void;
  // updateAgent: (agent: Agent) => void;
  // updateTask: (task: Task) => void;
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      <div className="m-2 border-b-2 border-solid border-dark text-acai-white flex flex-col">
        <h3 className="text-2x font-bold">Agents</h3>
        {/* <button onClick={() => setIsFormVisible(true)}>+</button> */}
        {config.agents.map((agent, index) => (
          // <AgentCard agent={agent} deleteAgent={deleteAgent} key={agent.id} />
          <AgentCard agent={agent} key={agent.id} />
        ))}
        {/* {isFormVisible && (
          <AgentForm
            onSubmit={({
              name,
              role,
              backstory,
              files,
              goal,
              llm,
              metadata,
              tools,
            }): void => {
              addAgent({
                id: uuidv4(),
                name,
                verbose: true,
                backstory,
                files,
                metadata,
                role,
                goal,
                llm: {
                  model_name: '',
                  base_url: '',
                  openai_api_key: '',
                },
                tools,
                allow_delegation: true,
              });
              setIsFormVisible(false);
            }}
            onCancel={() => setIsFormVisible(false)}
          />
        )} */}
      </div>
      <h2 className="text-2xl font-bold m-2">Tasks</h2>
      <ul className="m-2 border-b-2 border-solid border-dark text-acai-white flex flex-col">
        {config.tasks.map((task, index) => (
          // <TaskCard task={task} deleteTask={deleteTask} key={task.id} />
          <TaskCard task={task} key={task.id} />
        ))}
      </ul>
      {/* <form
        onSubmit={(event) => {
          event.preventDefault();
          const description = (event.target as HTMLInputElement).value;
          const agent = (event.target as HTMLInputElement).value;
          const tools = (event.target as HTMLInputElement).value.split(',');
          addTask({
            id: uuidv4(),
            name: 'Task',
            description,
            agent,
            tools,
          });
        }}
      >
        <label className="p-2">
          Description:
          <input type="text" name="description" />
        </label>
        <label className="p-2">
          Agent:
          <input type="text" name="agent" />
        </label>
        <label className="p-2">
          Tools:
          <input type="text" name="tools" />
        </label>
        <input type="submit" value="Submit" />
      </form> */}
    </div>
  );
};

export default CrewAIList;
