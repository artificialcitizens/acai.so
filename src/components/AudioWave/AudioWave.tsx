/* eslint-disable import/namespace */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useEffect } from 'react';
// eslint-disable-next-line import/namespace
import * as d3 from 'd3';

interface AudioWaveformProps {
  isOn: boolean;
  audioContext: AudioContext | null;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isOn,
  audioContext,
}) => {
  const ref = useRef<SVGSVGElement>(null);

  // useEffect(() => {
  //   let animationFrameId: number | null = null;
  //   let source: MediaStreamAudioSourceNode | null = null;
  //   const svg = d3.select(ref.current);
  //   const width = +svg.attr('width');
  //   const height = +svg.attr('height');
  //   const radius = Math.min(width, height) / 2;

  //   if (audioContext && isOn) {
  //     const analyser = audioContext.createAnalyser();
  //     if (!navigator.mediaDevices) {
  //       console.warn(
  //         'No media devices found, please enable audio access if you want to use the voice synthesis',
  //       );
  //       return;
  //     }
  //     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  //       const source = audioContext.createMediaStreamSource(stream);
  //       source.connect(analyser);

  //       const bufferLength = analyser.frequencyBinCount;
  //       const dataArray = new Uint8Array(bufferLength);

  //       const radialLine = d3
  //         .radialLine()
  //         .angle((d, i) => i * ((2 * Math.PI) / bufferLength))
  //         .radius((d) => {
  //           // Normalize data between 0 and 1
  //           const normalizedData = (d as any) / 100;
  //           const minLimit = 0.1;
  //           const maxLimit = 0.2;
  //           // Scale data between minLimit and maxLimit
  //           const scaledData =
  //             normalizedData * (maxLimit - minLimit) + minLimit;

  //           // Return scaled data as radius
  //           return scaledData * radius;
  //         });

  //       function renderFrame() {
  //         requestAnimationFrame(renderFrame);

  //         analyser.getByteTimeDomainData(dataArray);

  //         svg
  //           .selectAll('path')
  //           .data([dataArray])
  //           .join('path')
  //           .attr('transform', `translate(${width / 2}, ${height / 2})`)
  //           .attr('d', radialLine as any)
  //           .attr('stroke', 'white')
  //           .attr('stroke-width', 6)
  //           .attr('fill', 'none');
  //       }

  //       renderFrame();
  //     });
  //   }
  //   // Cleanup function
  //   return () => {
  //     if (animationFrameId !== null) {
  //       cancelAnimationFrame(animationFrameId);
  //     }
  //     if (source !== null) {
  //       source.disconnect();
  //     }
  //   };
  // }, [isOn, audioContext]);

  return (
    <div
      className="absolute w-[150px] h-[150px] transition-opacity duration-500"
      data-ava-element="audio-wave"
      style={{
        bottom: '-32px',
        left: '-32px',
        zIndex: 100,
        opacity: isOn ? 1 : 0,
        pointerEvents: isOn ? 'all' : 'none',
      }}
    >
      <svg ref={ref} width="150" height="150">
        <circle cx="75" cy="75" r="20" fill="rgba(9, 9, 9, 0.75)" />
        <circle
          className="animate-pulse"
          cx="75"
          cy="75"
          r="10"
          fill="#5F3C4F"
        />
      </svg>
    </div>
  );
};

export default AudioWaveform;
