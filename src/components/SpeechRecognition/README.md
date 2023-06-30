# SpeechRecognition Component

This is a Speech Recognition component built with React. It uses the Web Speech API to transcribe speech into text in real-time.

## Usage

```jsx
<SpeechRecognition
  onTranscriptionComplete={(transcript) => console.log(transcript)}
  active={true}
  onClick={() => console.log('Button clicked')}
/>
```

## Props

- `onTranscriptionComplete` (required): A callback function that is called when a transcript is ready. It receives the transcript as a string argument.
- `active` (required): A boolean that determines whether the speech recognition is active or not.
- `onClick` (optional): A callback function that is called when the speech recognition button is clicked.

## How it works

When the `active` prop is `true`, a new SpeechRecognition object is created and started. The `continuous` and `interimResults` properties are set to `true` to allow for continuous recognition and interim results, respectively.

The `onresult` event listener is set to handle the results of the speech recognition. When a final result is ready, the `onTranscriptionComplete` callback is called with the transcript.

The component renders a button that, when clicked, starts or stops the speech recognition depending on the `active` prop.

## Note

This component uses the `webkitSpeechRecognition` interface, which is a part of the Web Speech API. It is currently only supported in Google Chrome and it's based on the webkit engine.
