import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css'; // import the CSS file
import berry from '../../assets/acai-dot.png';

const tagLines = [
  'Your AI toolkit',
  'Your Personal Assistant',
  'Your supercharged productivity tool',
  'Your AI powered notebook',
  'Your digital life organizer',
  'Your smart work companion',
  'Your AI-driven taskmaster',
  'Your virtual efficiency expert',
  'Your intelligent work buddy',
  'Your AI productivity booster',
  'Your smart task organizer',
  'Your automated workflow assistant',
  'Your digital productivity coach',
  'Your smart work accelerator',
  'Your intelligent task manager',
  'Your smart AI companion',
  'Your personal AI secretary',
  'Your virtual work partner',
  'Your digital taskmaster',
  'Your intelligent productivity tool',
  'Your smart work assistant',
  'Your virtual AI secretary',
  'Your digital productivity partner',
  'Your AI-powered work companion',
  'Your intelligent work assistant',
  'Your smart productivity booster',
  'Your virtual task manager',
];

interface LandingPageProps {
  singleTagline?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ singleTagline = false }) => {
  const [tagLineIndex, setTagLineIndex] = useState(
    Math.floor(Math.random() * tagLines.length),
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [isTaglineComplete, setIsTaglineComplete] = useState(false);

  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (singleTagline && isTaglineComplete) return; // If singleTagline is true and the tagline is complete, stop the effect

    timers.current.push(
      setTimeout(() => {
        setWordIndex((prevIndex) => prevIndex + 1);
      }, 400),
    );

    if (wordIndex === tagLines[tagLineIndex].split(' ').length) {
      setIsTaglineComplete(true);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (!singleTagline) {
        // Only update the tagline if singleTagline is false
        timers.current.push(
          setTimeout(() => {
            setTagLineIndex((prevIndex) => (prevIndex + 1) % tagLines.length);
            setWordIndex(0);
            setIsTaglineComplete(false);
          }, 5000),
        );
      }
    }

    return () => timers.current.forEach(clearTimeout);
  }, [wordIndex, tagLineIndex, singleTagline, isTaglineComplete]);

  return (
    <>
      <nav className="w-screen bg-darker h-8">
        {/* <img src={berry} alt="acai logo" className="w-8 h-8 p-2 relative" /> */}
      </nav>
      <div className="text-acai-white relative bg-gradient-to-b from-darker to-acai-darker h-screen w-screen m-0 flex flex-col p-4 items-center justify-start">
        <span className="flex items-center">
          <h1 className="text-2xl text-acai-white md:text-4xl font-bold mb-0 z-10">
            acai
          </h1>
          {/* <img src={berry} alt="acai logo" className="w-8 h-8 relative" /> */}
        </span>
        <p className="mb-8 font-medium text-xs md:text-xs">powered by AVA</p>
        <div className="relative bg-darker rounded-3xl overflow-hidden w-3/4 h-3/4 z-10 shadow-lg">
          <img
            src={''}
            alt="App Screenshot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darker to-acai-darker bg-opacity-100 flex items-start justify-start p-8 md:p-2 md:items-center md:justify-center transition-opacity duration-500 group-hover:opacity-0">
            <p className="text-2xl md:text-4xl text-acai-white">
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
    </>
  );
};

export default LandingPage;
