import React from 'react';
import { Agent } from '../use-crew-ai';
import { v4 as uuidv4 } from 'uuid';

interface AgentFormProps {
  onSubmit: (agent: Agent) => void;
  onCancel: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ onSubmit, onCancel }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement)
          .value;
        const role = (form.elements.namedItem('role') as HTMLInputElement)
          .value;
        const backstory = (
          form.elements.namedItem('backstory') as HTMLInputElement
        ).value;
        const files = (
          form.elements.namedItem('files') as HTMLInputElement
        ).value.split(',');
        // const metadata = (
        //   form.elements.namedItem('metadata') as HTMLInputElement
        // ).value;
        const goal = (form.elements.namedItem('goal') as HTMLInputElement)
          .value;
        // const llm = (form.elements.namedItem('llm') as HTMLInputElement).value;
        const tools = (
          form.elements.namedItem('tools') as HTMLInputElement
        ).value.split(',');
        // const verbose = (form.elements.namedItem('verbose') as HTMLInputElement)
        //   .checked;
        onSubmit({
          id: uuidv4(),
          name,
          role,
          goal,
          files,
          backstory,
          metadata: {},
          llm: {
            model_name: 'llm',
            base_url: '',
            openai_api_key: '',
          },
          tools,
          verbose: true,
          allow_delegation: true,
        });
      }}
    >
      <label>
        Name:
        <input type="text" name="name" required />
      </label>
      <label>
        Role:
        <input type="text" name="role" required />
      </label>
      <label>
        Goal:
        <input type="text" name="goal" required />
      </label>
      <label>
        LLM:
        <input type="text" name="llm" required />
      </label>
      <label>
        Tools (comma-separated):
        <input type="text" name="tools" required />
      </label>
      <button type="submit">Add Agent</button>
      <button type="button" onClick={() => onCancel()}>
        Cancel
      </button>
    </form>
  );
};

export default AgentForm;
