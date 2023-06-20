import './App.css';
import MicRecorder from './components/MicRecorder/MicRecorder';
import TipTap from './components/TipTap/TipTap';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <>
      <MicRecorder onRecordingComplete={(blob) => console.log(blob)} />
      <Chat onSubmitHandler={async (message) => `hello ${message}`} />
      {/* <TipTap label="test" onClickHandler={async () => 'hello world'} /> */}
    </>
  );
}

export default App;
