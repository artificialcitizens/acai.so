# ACAI custom agent example Nodejs server

An example server for interacting with the ACAI Toolkit. You can use this example to begin building your own automated virtual agent

## Installation

To install the dependencies, run `npm install

## Starting the Server

To start the server, run `npm run dev`. The server listens on port 3000.

## Routes

### GET /test

A simple test route that returns "Hello world".

### POST /v1/agent

Note: this is a work in progress and subject to change, this will be updated as the data model progresses

This route is used to receive and log payload from the client. The payload should contain the following properties:

```
type MessageType = 'user' | 'ava';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  type: MessageType;
}

type Messages = Message[];
```

- userMessage: string
- userName: string
- userLocation: string
- customPrompt: string
- chatHistory: Messages
- currentDocument: string

### GET /ava

This route is used to receive a query from the client and send it to the `avaChat` function. It then emits the response to the client via socket.io. The query should be passed as a query parameter.

### GET /proxy

This route is used to proxy a GET request to another URL. The URL should be passed as a query parameter.

## Socket.io

The server is also a Socket.io server. It listens for connections and disconnections. When a client connects or disconnects, the server logs the client's socket id.

The server also emits events to the client when certain actions occur. These events include:

- data-received
- agent-action
- processing
- error
- create-tab

## Authentication

The server uses a simple password-based authentication for socket.io connections. The password should be passed in the handshake when the client connects. The password is currently hardcoded as 'your_password_here'.
