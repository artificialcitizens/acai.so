import { createMachine } from 'xstate';

export const appStateMachine = createMachine({
  id: 'app',
  initial: 'loading',
  states: {
    loading: { on: { LOAD_SUCCESS: 'loaded' } },
    loaded: { on: { LOGOUT: 'loading' } },
  },
});

export const userStateMachine = createMachine({
  id: 'user',
  initial: 'loggedOut',
  states: {
    loggedOut: { on: { LOGIN_SUCCESS: 'loggedIn' } },
    loggedIn: { on: { LOGOUT: 'loggedOut' } },
  },
});
