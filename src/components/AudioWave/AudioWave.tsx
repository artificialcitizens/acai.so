/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface AudioWaveformProps {
  isOn: boolean;
  audioContext: AudioContext | null;
}
// @TODO: Creata a state that manages if the user or assistant is speaking
// @TODO: Update to fill in and change color when it's assistants turn to speak
// @TODO: Update to use mic or audio from the application
const AudioWaveform: React.FC<AudioWaveformProps> = ({ isOn, audioContext }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const radius = Math.min(width, height) / 2;

    if (audioContext) {
      const analyser = audioContext.createAnalyser();

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

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
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 5)
            .attr('fill', 'none');
        }

        renderFrame();
      });
    } else {
      // Render a radial line with the radius of the data circle when there's no audio context
      const radialLine = d3
        .radialLine()
        .angle(() => 0)
        .radius(() => radius);

      svg
        .selectAll('path')
        .data([0])
        .join('path')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .attr('d', radialLine)
        .attr('stroke', 'none')
        .attr('fill', 'none');
    }
  }, [isOn, audioContext]);

  return (
    <div
      className="fixed w-[150px] h-[150px] transition-opacity duration-500"
      style={{
        bottom: '0',
        left: '0',
        zIndex: 100,
        opacity: isOn ? 1 : 0,
      }}
    >
      <svg ref={ref} width="150" height="150" />
    </div>
  );
};

export default AudioWaveform;
