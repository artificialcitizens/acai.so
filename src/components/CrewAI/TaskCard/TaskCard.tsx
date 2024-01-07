import React, { useState } from 'react';
import { Task } from '../use-crew-ai'; // Assuming you have a types file

interface TaskCardProps {
  task: Task;
  deleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, deleteTask }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ul className="bg-darker rounded-md p-4 mb-2" key={task.id}>
        <li className="p-2">Name: {task.name}</li>
        {showDetails && (
          <>
            <li className="p-2">Description: {task.description}</li>
            <li className="p-2">Agent: {task.agent}</li>
            <li className="p-2">Tools: {task.tools?.join('|')}</li>
          </>
        )}
      </ul>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button className="mr-1" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'x' : '...'}
        </button>
        {/* <button
          onClick={() => {
            window.confirm('Are you sure you want to delete this Task?') &&
              deleteTask(task.id);
          }}
        >
          X
        </button> */}
      </div>
    </div>
  );
};
