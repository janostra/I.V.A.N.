const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // Este lo obtenés desde ElevenLabs

// Cambiamos la carpeta de salida a "audio/response"
const outputDir = path.join(__dirname, '..', 'audio', 'response');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Función para obtener el siguiente número de archivo
function getNextAudioNumber() {
  const files = fs.readdirSync(outputDir);
  const audioFiles = files.filter(file => file.startsWith('audio_') && file.endsWith('.mp3'));
  const numbers = audioFiles.map(file => parseInt(file.split('_')[1].split('.mp3')[0]));
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return nextNumber;
}

async function textToSpeech(text) {
  const fileNumber = getNextAudioNumber();
  const fileName = `audio_${fileNumber}.mp3`;
  const outputPath = path.join(outputDir, fileName);

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      responseType: 'stream',
      data: {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        }
      }
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Audio generado en: ${outputPath}`);
        resolve(`/audio/response/${fileName}`); // Ruta relativa al archivo generado
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error en ElevenLabs:', error.response?.data || error.message);
    throw new Error('Error al generar audio con ElevenLabs.');
  }
}

module.exports = { textToSpeech };
