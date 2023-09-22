declare module 'global' {
  global {
    interface Window {
      audioContext?: AudioContext;
    }
  }
}
