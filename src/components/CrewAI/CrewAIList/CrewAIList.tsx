import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AgentCard } from '../Agent';
import { TaskCard } from '../Task';
import { Crew, Task, newAgent, newTask, useCrewAi } from '../use-crew-ai';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

interface DraggableProps {
  id: string;
  parent: string;
  setParent: (parent: string) => void;
  children: React.ReactNode;
}

const DraggableTask: React.FC<DraggableProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '100%',
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
};

const CrewAIList = ({ crew }: { crew: Crew }) => {
  const { addAgentToCrew, addTaskToCrew, models, saveCrew } = useCrewAi();
  const [parent, setParent] = useState<string>('');
  async function handleAgentDragEnd(event: { active: any; over: any }) {
    const { active, over } = event;

    if (over) {
      const oldIndex = crew.agents.findIndex((agent) => agent.id === active.id);
      const newIndex = crew.agents.findIndex((agent) => agent.id === over.id);

      const newAgents = Array.from(crew.agents);
      const [removed] = newAgents.splice(oldIndex, 1);
      newAgents.splice(newIndex, 0, removed);

      const newCrew = {
        ...crew,
        agents: newAgents,
      };

      saveCrew(newCrew);
    }
  }

  async function handleTaskDragEnd(event: { active: any; over: any }) {
    const { active, over } = event;

    if (over) {
      const oldIndex = crew.tasks.findIndex((task) => task.id === active.id);
      const newIndex = crew.tasks.findIndex((task) => task.id === over.id);

      const newTasks = Array.from(crew.tasks);
      const [removed] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, removed);

      const newCrew = {
        ...crew,
        tasks: newTasks,
      };

      saveCrew(newCrew);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  return (
    <div className="w-full max-h-full flex flex-col overflow-y-auto">
      <div className=" text-acai-white flex flex-col">
        <h2 className="text-acai-white text-sm mb-4">Agents</h2>
        <DndContext onDragEnd={handleAgentDragEnd} sensors={sensors}>
          <ul className=" text-acai-white flex flex-col">
            <SortableContext items={crew.agents}>
              {crew.agents.map((agent, index) => (
                <DraggableTask
                  key={agent.id}
                  id={agent.id}
                  parent={parent}
                  setParent={setParent}
                >
                  <AgentCard crewId={crew.id} agent={agent} />
                </DraggableTask>
              ))}
            </SortableContext>
          </ul>
        </DndContext>
      </div>
      <button
        className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 mb-2 mx-8 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        onClick={() => {
          addAgentToCrew(
            crew.id,
            newAgent({
              id: uuidv4(),
              llm: models[0],
            }),
          );
        }}
      >
        Add Agent
      </button>

      <h2 className="text-acai-white text-sm mb-4">Tasks</h2>

      <DndContext onDragEnd={handleTaskDragEnd} sensors={sensors}>
        <ul className="text-acai-white flex flex-col">
          <SortableContext items={crew.tasks}>
            {crew.tasks.map((task, index) => (
              <DraggableTask
                key={task.id}
                id={task.id}
                parent={parent}
                setParent={setParent}
              >
                <TaskCard crewId={crew.id} task={task} />
              </DraggableTask>
            ))}
          </SortableContext>
        </ul>
      </DndContext>
      <button
        className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 mb-2 mx-8 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        onClick={() => {
          addTaskToCrew(
            crew.id,
            newTask({
              id: uuidv4(),
              agent: crew.agents[0].role,
            }),
          );
        }}
      >
        Add Task
      </button>
    </div>
  );
};

export default CrewAIList;
