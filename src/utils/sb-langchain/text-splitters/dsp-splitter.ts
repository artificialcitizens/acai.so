/**
 * Split DSP Transcript into a list of speakers
 * and their respective content
 */
export function convertDSPTranscript(transcript: string) {
  const speakers = [];
  let currentSpeaker = '';
  let currentContent = '';

  const lines = transcript.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes(':')) {
      // Reached a new speaker
      if (currentSpeaker) {
        speakers.push({
          name: currentSpeaker,
          content: currentContent,
        });
        currentContent = '';
      }
      currentSpeaker = line;
    } else {
      // Accumulate content
      currentContent += line + ' ';
    }
  }

  // Add final speaker
  speakers.push({
    name: currentSpeaker,
    content: currentContent,
  });

  return speakers;
}
