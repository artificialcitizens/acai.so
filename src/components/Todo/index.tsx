/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useMachine } from '@xstate/react';
import todoListMachine from '../../machines/todo.xstate';
import qs from 'qs';

interface Task {
  name: string;
  complete: boolean;
  id: string;
}

interface TodoList {
  id: string;
  listName: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

const TodoList: React.FC = () => {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [selectedList, setSelectedList] = useState<TodoList | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/todos/')
      .then((response) => response.json())
      .then((data) => {
        setTodoLists(data.docs);
        setSelectedList(data.docs[0]); // Select the first list by default
      });
  }, []);

  const addTodo = async (title: string) => {
    if (!selectedList) return;

    const newTask: Task = {
      name: title,
      complete: false,
      id: Math.random().toString(), // Replace this with a proper ID generation
    };

    const updatedList = { ...selectedList, tasks: [...selectedList.tasks, newTask] };

    try {
      const req = await fetch(`http://localhost:3000/api/todos/${selectedList.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      const data = await req.json();
      setTodoLists(todoLists.map((list) => (list.id === selectedList.id ? { ...data, tasks: data.tasks } : list)));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTodoByName = async (taskName: string) => {
    if (!selectedList) return;

    const stringifiedQuery = qs.stringify(
      {
        where: {
          name: {
            contains: taskName,
          },
        },
      },
      { addQueryPrefix: true },
    );

    try {
      const req = await fetch(`/api/todos/${selectedList.id}${stringifiedQuery}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await req.json();
      setTodoLists(todoLists.map((list) => (list.id === selectedList.id ? { ...data, tasks: data.tasks } : list)));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTodo = async (taskId: string) => {
    if (!selectedList) return;

    const updatedTasks = selectedList.tasks.filter((task) => task.id !== taskId);
    const updatedList = { ...selectedList, tasks: updatedTasks };

    try {
      const req = await fetch(`http://localhost:3000/api/todos/${selectedList.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      const data = await req.json();
      setTodoLists(todoLists.map((list) => (list.id === selectedList.id ? { ...data, tasks: data.tasks } : list)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleListChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedListId = event.target.value;
    try {
      const req = await fetch(`http://localhost:3000/api/todos/${selectedListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await req.json();
      setSelectedList(data);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    if (!selectedList) return;

    const updatedTasks = selectedList.tasks.map((task) =>
      task.id === taskId ? { ...task, complete: !task.complete } : task,
    );

    const updatedList = { ...selectedList, tasks: updatedTasks };

    try {
      const req = await fetch(`http://localhost:3000/api/todos/${selectedList.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      const data = await req.json();
      setTodoLists(todoLists.map((list) => (list.id === selectedList.id ? { ...list, tasks: data.tasks } : list)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const titleInput = event.currentTarget.elements.namedItem('title') as HTMLInputElement;
    addTodo(titleInput.value);
    titleInput.value = '';
  };

  return (
    <div className="container mx-auto rounded-md  p-4 border-2 border-solid">
      <select onChange={handleListChange} className="mb-4 p-4 border border-white rounded">
        {todoLists.map((list) => (
          <option key={list.id + list.listName} value={list.id}>
            {list.listName}
          </option>
        ))}
      </select>
      <ul>
        {selectedList?.tasks.map((task) => (
          <li
            key={task.id + task.name}
            className="flex justify-between items-center bg-transparent p-4 my-2 rounded border-2 border-solid"
          >
            <span className={task.complete ? 'line-through' : ''} onClick={() => toggleTaskComplete(task.id)}>
              {task.name}
            </span>
            <div>
              <button onClick={() => deleteTodo(task.id)} className="text-white">
                x
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input name="title" className="rounded p-2 w-full" placeholder="New todo" />
        <button type="submit" className="bg-transparent text-white p-2 mt-2 rounded border border-solid border-white ">
          Add
        </button>
      </form>
    </div>
  );
};

export default TodoList;
