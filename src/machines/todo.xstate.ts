import { Machine, assign } from 'xstate';
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

const todoListMachine = Machine<TodoList, any, any>(
  {
    id: 'todoList',
    initial: 'loading',
    context: {
      todoLists: [],
      selectedList: null,
    },
    states: {
      loading: {
        invoke: {
          id: 'fetchTodoLists',
          src: 'fetchTodoLists',
          onDone: {
            target: 'idle',
            actions: assign({
              todoLists: (context, event) => event.data.docs,
              selectedList: (context, event) => event.data.docs[0],
            }),
          },
          onError: {
            target: 'failure',
          },
        },
      },
      idle: {
        on: {
          ADD_TODO: {
            actions: ['addTodo'],
          },
          DELETE_TODO_BY_NAME: {
            actions: ['deleteTodoByName'],
          },
          DELETE_TODO: {
            actions: ['deleteTodo'],
          },
          HANDLE_LIST_CHANGE: {
            actions: ['handleListChange'],
          },
        },
      },
      failure: {
        type: 'final',
      },
    },
  },
  {
    services: {
      fetchTodoLists: (context) => fetch('http://localhost:3000/api/todos/').then((response) => response.json()),
    },
    actions: {
      addTodo: (context, event) => {
        // Your existing addTodo logic here...
      },
      deleteTodoByName: (context, event) => {
        // Your existing deleteTodoByName logic here...
      },
      deleteTodo: (context, event) => {
        // Your existing deleteTodo logic here...
      },
      handleListChange: (context, event) => {
        // Your existing handleListChange logic here...
      },
    },
  },
);

export default todoListMachine;
