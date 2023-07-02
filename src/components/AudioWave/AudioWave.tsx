import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface AudioWaveformProps {
  isOn: boolean;
  audioContext: AudioContext | null;
}

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

        const gradient = svg.append('defs').append('radialGradient').attr('id', 'radial-gradient');

        gradient.append('stop').attr('offset', '0%').attr('stop-color', '#9370DB');

        gradient.append('stop').attr('offset', '100%').attr('stop-color', 'white');

        function renderFrame() {
          requestAnimationFrame(renderFrame);

          analyser.getByteTimeDomainData(dataArray);

          svg
            .selectAll('path')
            .data([dataArray])
            .join('path')
            .transition() // Add transition
            .duration(100) // Adjust duration to match data update rate
            .ease(d3.easeLinear) // Use linear easing for smooth transition
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('d', radialLine)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('fill', 'url(#radial-gradient)')
            .attr('opacity', 0.5);
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
      className=" w-[150px] h-[150px] transition-opacity duration-500"
      style={{
        position: 'fixed',
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
