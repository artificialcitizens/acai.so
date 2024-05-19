import { createMachine, assign, actions } from 'xstate';

export interface ProtoContext {
  fileContent: string;
}

const saveFileContent = (fileContent: string) => {
  localStorage.setItem('App.tsx', fileContent);
};

const loadFileContent = (): string => {
  return localStorage.getItem('App.tsx') || '';
};

const initialContext: ProtoContext = {
  fileContent: '',
};

const { pure } = actions;

export type ProtoEvent = {
  type: 'UPDATE_FILE_CONTENT';
  fileContent: string;
};

export const protoMachine = createMachine<ProtoContext, ProtoEvent>({
  id: 'proto',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      onEntry: assign({
        fileContent: (context, event) => loadFileContent(),
      }),
    },
  },
  on: {
    UPDATE_FILE_CONTENT: {
      actions: pure((context, event) => {
        console.log(context.fileContent);
        const updatedFileContent = event.fileContent;
        return [
          assign({ fileContent: updatedFileContent }),
          actions.assign((ctx) => {
            saveFileContent(updatedFileContent);
            return ctx;
          }),
        ];
      }),
    },
  },
});
