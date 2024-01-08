# WIP

## Crew Builder

| Property    | Type                  | Description                              |
| ----------- | --------------------- | ---------------------------------------- | ----- | ----------------- |
| id          | string                | Unique ID for the crew                   |
| name        | string                | Name of the crew                         |
| agents      | Agent[]               | Array of Agent objects                   |
| tasks       | Task[]                | Array of Task objects                    |
| files       | File[]                | Array of File objects                    |
| createdAt   | string                | ISO date string of when crew was created |
| lastUpdated | string                | ISO date string of last update to crew   |
| metadata    | Record<string, string | number                                   | JSON> | Optional metadata |
| process     | string                | Optional additional process info         |

Agent:

| Property         | Type                  | Description                     |
| ---------------- | --------------------- | ------------------------------- | ----- | ----------------- |
| id               | string                | Unique ID for the agent         |
| name             | string                | Name of the agent               |
| role             | string                | Role/job of the agent           |
| goal             | string                | Goal for the agent              |
| verbose          | boolean               | Whether to output verbose logs  |
| backstory        | string                | Backstory for the agent         |
| allow_delegation | boolean               | Can the agent delegate work?    |
| tools            | string[]              | List of tool IDs used           |
| llm              | Llm                   | Config for large language model |
| files            | string[]              | List of file IDs used           |
| metadata         | Record<string, string | number                          | JSON> | Optional metadata |

Task:

| Property    | Type                  | Description              |
| ----------- | --------------------- | ------------------------ | ----- | ----------------- |
| id          | string                | Unique ID for the task   |
| name        | string                | Name of the task         |
| description | string                | Description of the task  |
| agent       | string                | ID of the assigned agent |
| tools       | string[]              | List of tool IDs used    |
| files       | string[]              | List of file IDs used    |
| metadata    | Record<string, string | number                   | JSON> | Optional metadata |

File:

| Property | Type                  | Description            |
| -------- | --------------------- | ---------------------- | ----- | ----------------- |
| id       | string                | Unique ID for the file |
| name     | string                | Name of the file       |
| type     | string                | Mime type of the file  |
| data     | string                | File contents          |
| metadata | Record<string, string | number                 | JSON> | Optional metadata |

This React hook manages a crew configuration and integrates with a backend API to run AI tasks.
