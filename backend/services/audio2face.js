const sendToAudio2Face = async (audioFilePath) => {
    const audioData = fs.readFileSync(audioFilePath);
  
    await axios.post('http://localhost:8011/audio', audioData, {
      headers: {
        'Content-Type': 'audio/mpeg', // O 'audio/wav' si es WAV
      },
    });
  
    console.log('Audio enviado a Audio2Face');
  };
  