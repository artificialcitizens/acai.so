WIP: Nothing to see here yet, check back soon!

# Langchain JS Crash Course

Langchain is a powerful tool that allows you to compose language models in to chains (Lang Chain get it?).

This repo is designed to get you up and running with the JavaScript version of this library. We will be focused on Langchain's core functionality and how to use it in your own projects.

This library is bleeding edge and constantly changing, so we will be adding the latest features as they become available/time allows.

note: The content in this course assumes that you are leveraging a server to manage you environment variables, never store these in your client side code. The code in this repo is for demonstration purposes only and should not be used in production.

## Technology Stack

- [LangchainJS](https://js.langchain.com/docs/)
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Storybook](https://storybook.js.org/) - A tool for developing UI components in isolation
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development
- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that adds optional static types
- [Vite](https://vitejs.dev/) - A build tool and development server that focuses on speed and simplicity
- [Vitest](https://vitest.dev/) - A test runner for Vite projects
- [ESLint](https://eslint.org/) - A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript
- [Prettier](https://prettier.io/) - An opinionated code formatter

## Getting Started

Clone this repo and install the dependencies:

```bash
git clone
cd langchain-js-crash-course
npm install
npm run storybook
```

## Running the App

The crash course takes place in Storybook, however you can run the app in development mode using Vite if you want to experiment with the components in a standard React app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Running the Tests

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode using Vite.

### `npm run build`

Builds the app for production using TypeScript and Vite.

### `npm run lint`

Lints the source code using ESLint.

### `npm run preview`

Runs a local preview of the production build using Vite.

### `npm run storybook`

Starts the Storybook development server on port 6006.

### `npm run build-storybook`

Builds the Storybook for deployment.

### `npm run coverage`

Runs the tests with coverage using Vitest.

### `npm run test`

Runs the tests using Vitest.

### `npm run test:ui`

Runs the tests with UI using Vitest.

## License

MIT
