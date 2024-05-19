import { FewShotPromptTemplate, PromptTemplate } from 'langchain/prompts';
import { examples } from './few-shot-examples';

const responseTemplate = `Use the following context and prior user requests if available
to create a response to the users question.
Current Component: {context}

Prior User Request: {conversation_history}

User Request: {question}
`;

const examplePrompt = new PromptTemplate({
  inputVariables: ['question', 'context', 'conversation_history', 'answer'],
  template: responseTemplate,
});

const example = `query: 'A landing page with 3 pricing cards',
output:import React from 'react';

const PricingCard = ({ title, price, features }) => {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold">{title}</h2>
      <h3 className="my-4 text-4xl font-bold">\${price}</h3>
      <ul>
        {features.map((feature, index) => (
          <li key={index} className="mb-2 text-center">
            {feature}
          </li>
        ))}
      </ul>
      <button className="mt-6 px-6 py-2 text-white bg-blue-500 rounded-lg">Purchase</button>
    </div>
  );
};

const App = () => {
  const pricingPlans = [
    { title: 'Basic', price: '10', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { title: 'Pro', price: '20', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'] },
    { title: 'Premium', price: '30', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="grid gap-6 p-6 mt-24 md:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <PricingCard key={index} {...plan} />
        ))}
      </div>
    </div>
  );
};

export default App;`;

const protoPrompt = PromptTemplate.fromTemplate(`### Ignore prior instructions:
You are tasked with helping build an App React component for a frontend system.
######

Use the following component as a reference unless the user wants a new component:
Context: {context}


###############
  Given the user query, generate a React component to the specifications. If there is an example component given, attempt to iterate off of the given component.
  Make sure to include any imports the user has included in their code.

  Rules and Coding Standards that you must adhere to:
- Strict Typescript checking
- ES6 syntax
- Functional components only
- use const over let, unless absolutely necessary
- Controlled components are preferred
- Name of component must be App
- Only style using tailwind classnames or inline styles
- DO NOT USING ANY EXTERNAL LIBS OR FILES

Tech Stack

Vite
React 18
Tailwind CSS
  Only output the raw formatted code without any wrapping markdown or explanations.
DO NOT FORGET TO INCLUDE IMPORTS AND ONLY PROVIDE THE RAW CODE OUTPUT
`);

/**
 * Creates the proto agent response prompt
 */
export const protoAgentResponsePrompt = async ({
  context,
  conversation_history,
}: {
  context: string;
  conversation_history: string;
}) => {
  const prompt = await protoPrompt.format({
    context: context,
    conversation_history: conversation_history,
  });

  return prompt;
};
