const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // Este lo obtenés desde ElevenLabs

const outputDir = path.join(__dirname, '..', 'audio');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function textToSpeech(text, fileName = 'ivan-response.mp3') {
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

    const outputPath = path.join(outputDir, fileName);
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/audio/${fileName}`));
      writer.on('error', reject);
    });

  } catch (error) {
    console.error('Error en ElevenLabs:', error.response?.data || error.message);
    throw new Error('Error al generar audio con ElevenLabs.');
  }
}

module.exports = { textToSpeech };
