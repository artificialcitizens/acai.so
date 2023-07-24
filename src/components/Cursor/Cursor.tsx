import React, { useEffect, useRef, useState } from 'react';
import './Cursor.css';

interface Coordinate {
  x: number;
  y: number;
}

interface CursorProps {
  coordinates: Coordinate[];
  onReachedDestination?: () => void;
  speed?: number;
}

const Cursor: React.FC<CursorProps> = ({ coordinates, onReachedDestination, speed = 0.15 }) => {
  const [currentCoordinateIndex, setCurrentCoordinateIndex] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (cursor && currentCoordinateIndex < coordinates.length) {
      const { x, y } = coordinates[currentCoordinateIndex];
      cursor.style.transitionDuration = `${speed}s`;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, [coordinates, currentCoordinateIndex, speed]);

  const handleTransitionEnd = () => {
    if (currentCoordinateIndex < coordinates.length - 1) {
      setCurrentCoordinateIndex(currentCoordinateIndex + 1);
    } else if (onReachedDestination) {
      onReachedDestination();
    }
  };

  return <div className="cursor" ref={cursorRef} onTransitionEnd={handleTransitionEnd} />;
};

export default Cursor;
