export const examples = [
  {
    question: 'A landing page with 3 pricing cards',
    conversation_history: '',
    context: '',
    answer: `import React from 'react';

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

export default App;
`,
  },
];
