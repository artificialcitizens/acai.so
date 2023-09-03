# BYOA: Bring your own agent (WIP)

A key feature of the ACAI toolkit is the ability to integrate your own agent into the platform.

By leveraging event driven architecture, web sockets, and user defined callbacks, anyone can learn to power ACAI with their own natural language processing server.

## Getting Started

There are two example servers in this directory to get you started understanding the philosophy behind the ACAI platform.

Please note that this is an early alpha application and the API is changing rapidly; we are actively building out our own agentic system and working with other developers to integrate their current work into the ACAI platform.

Visit the desired example directory to get started at `examples/python_agent_server` or `examples/node_agent_server`.

Once the server is setup visit the [acai.so](https://acai.so) and enter the URL of your server and press connect, you should see a confirmation toast.
To test the demo server type "Hello" into the chat box and press enter. You should see a response from the server demoing the various socket callbacks available.

## Routes

### POST /v1/agent

Note: this is a work in progress and subject to change, this will be updated as the data model progresses

This route is used to receive and log payload from the client. The payload should contain the following properties:

```
type Message = {
    id: string;
    text: string;
    timestamp: string;
    type: MessageType;
}
```

- userMessage: string
- userName: string
- userLocation: string
- customPrompt: string
- chatHistory: Message[]
- currentDocument: string

```
curl -X POST -H "Content-Type: application/json" \
  -d '{
  "userMessage": "Hello",
  "userName": "John Doe",
  "userLocation": "San Francisco",
  "customPrompt": "Custom Prompt",
  "chatHistory": [
    {
      "message": "Hello",
      "sender": "user"
    },
    {
      "message": "Hi",
      "sender": "ava"
    }
  ],
  "currentDocument": "Current Document"
}' \
  http://localhost:5000/v1/agent
```

## Socket Callbacks

      <!-- socket.off('create-tab', handleTab);
      socket.off('error', (err: any) => {
        console.error(err);
        toastifyError(err.message);
      });
      socket.off('agent-log', (data: string) => {
        toastifyAgentLog(data);
      });
      socket.off('info-toast', (err: any) => {
        console.error(err);
        toastifyInfo(err.message);
      }); -->

### create-tab

This callback is used to create a new tab in the ACAI interface.

The payload:

```
data: { title: string; content: string }

```

### agent-log

Log data in the Log tab of the ACAI interface.

The payload:

```
data: string
```

### info-toast

Display a toast notification in the ACAI interface.

The payload:

```
data: string
```

### error

Display an error toast notification in the ACAI interface with the error message.

The payload:

```
data: string
```
