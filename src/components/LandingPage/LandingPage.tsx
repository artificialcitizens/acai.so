import React, { useState, useEffect, useRef } from 'react';
import screenshot from '../../assets/app-screenshot.png';
import './LandingPage.css'; // import the CSS file

const tagLines = [
  'Acai is an AI powered super tool',
  'Acai compliments your workflow',
  'Acai expands your capabilities',
  'Acai is your personal assistant',
  'Acai empowers you to do more',
  // Add more taglines as needed
];

const LandingPage: React.FC = () => {
  const [tagLineIndex, setTagLineIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [isTaglineComplete, setIsTaglineComplete] = useState(false);

  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    timers.current.push(
      setTimeout(() => {
        setWordIndex((prevIndex) => prevIndex + 1);
      }, 500),
    ); // Adjust speed as needed

    if (wordIndex === tagLines[tagLineIndex].split(' ').length) {
      setIsTaglineComplete(true);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      timers.current.push(
        setTimeout(() => {
          setTagLineIndex((prevIndex) => (prevIndex + 1) % tagLines.length);
          setWordIndex(0);
          setIsTaglineComplete(false);
        }, 2000),
      ); // Fade-out animation duration
    }

    return () => timers.current.forEach(clearTimeout);
  }, [wordIndex, tagLineIndex]);

  return (
    <div className="relative bg-gradient-to-b from-darker to-acai-darker h-screen w-screen m-0 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl mb-8 z-10">acai.so</h1>
      <div className="relative bg-darker rounded-xl overflow-hidden w-3/4 h-3/4 z-10 group">
        <img
          src={screenshot}
          alt="App Screenshot"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-0">
          <p className="text-4xl text-white">
            {tagLines[tagLineIndex].split(' ').map((word, index) => (
              <span
                key={index}
                className={index < wordIndex ? 'fade-in' : 'fade-out'}
                style={{
                  visibility:
                    index < wordIndex || isTaglineComplete
                      ? 'visible'
                      : 'hidden',
                }}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
