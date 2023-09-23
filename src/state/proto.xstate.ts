import { createMachine, assign } from 'xstate';

interface ProtoContext {
  fileContent: string;
}

export const protoMachine = createMachine<ProtoContext>({
  id: 'proto',
  initial: 'idle',
  context: {
    fileContent: '',
  },
  states: {
    idle: {},
  },
  on: {
    UPDATE_FILE_CONTENT: {
      actions: assign((context, event) => {
        return { fileContent: event.fileContent };
      }),
    },
  },
});
