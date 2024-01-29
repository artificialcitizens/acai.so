import React, { useState, useEffect, useRef } from 'react';

const App: React.FC = () => {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [paddlePosition, setPaddlePosition] = useState(50);
  const [ballDirection, setBallDirection] = useState({ x: 2, y: 2 });
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveBall = () => {
      setBallPosition((prevPos) => ({
        x: prevPos.x + ballDirection.x,
        y: prevPos.y + ballDirection.y,
      }));

      if (ballPosition.x >= 98 || ballPosition.x <= 2) {
        setBallDirection((prevDir) => ({
          ...prevDir,
          x: -prevDir.x,
        }));
      }

      if (ballPosition.y >= 98 || ballPosition.y <= 2) {
        setBallDirection((prevDir) => ({
          ...prevDir,
          y: -prevDir.y,
        }));
      }
    };

    const interval = setInterval(moveBall, 50);

    return () => clearInterval(interval);
  }, [ballPosition, ballDirection]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (gameAreaRef.current) {
        const { left, width } = gameAreaRef.current.getBoundingClientRect();
        const paddlePos = ((event.clientX - left) / width) * 100;
        setPaddlePosition(paddlePos);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <div
        style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
        className="absolute bg-white w-8 h-8 rounded-full"
      ></div>
      <div
        style={{ left: `${paddlePosition}%` }}
        className="absolute bottom-0 bg-white h-2 w-24"
      ></div>
    </div>
  );
};

export default App;
