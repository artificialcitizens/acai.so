import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface AudioWaveformProps {
  isOn: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isOn }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const startAudioContext = () => {
    if (!audioContext) {
      const newAudioContext = new AudioContext();
      setAudioContext(newAudioContext);
    } else if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  useEffect(() => {
    if (isOn && audioContext) {
      const analyser = audioContext.createAnalyser();

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const svg = d3.select(ref.current);
        const width = +svg.attr('width');
        const height = +svg.attr('height');
        const radius = Math.min(width, height) / 2;

        const radialLine = d3
          .radialLine()
          .angle((d, i) => i * ((2 * Math.PI) / bufferLength))
          .radius((d) => (1 - d / 255) * radius);

        function renderFrame() {
          requestAnimationFrame(renderFrame);

          analyser.getByteTimeDomainData(dataArray);

          svg
            .selectAll('path')
            .data([dataArray])
            .join('path')
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('d', radialLine)
            .attr('stroke', 'steelblue')
            .attr('fill', 'none');
        }

        renderFrame();
      });
    }
  }, [isOn, audioContext]);

  return (
    <div>
      <button onClick={startAudioContext}>Start</button>
      <svg ref={ref} width="300" height="300" />
    </div>
  );
};

export default AudioWaveform;
