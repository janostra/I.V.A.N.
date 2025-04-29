const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { OpenAI } = require('openai');
const { textToSpeech } = require('../services/elevenlabsService');
const animateFace = require('../services/a2fHeadlessClient');  
// — asume que a2fHeadlessClient expone la función animateFace(wavPath)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function talk(req, res) {
  const inputPath = req.file.path;
  // vamos a generar WAV en vez de mp3
  const timestamp = Date.now();
  const wavRequestPath = path.join(__dirname, '..', 'audio', 'request', `${timestamp}.wav`);
  const wavResponsePath = path.join(__dirname, '..', 'audio', 'response', `resp-${timestamp}.wav`);

  try {
    // 1. Convertir la grabación original a WAV de 16-bit 48 kHz (asegura compatibilidad A2F)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-acodec pcm_s16le',
          '-ar 48000',
          '-ac 1'
        ])
        .toFormat('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(wavRequestPath);
    });

    // 2. Transcripción con Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavRequestPath),
      model: 'whisper-1',
    });
    const userText = transcription.text;
    console.log('Usuario dijo:', userText);

    // 3. Contexto RAG
    const rag = await axios.post('http://localhost:8001/rag/query', { query: userText });
    const context = rag.data.context;
    console.log('Contexto RAG:', context);

    // 4. GPT-4 responde
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `Contexto:\n${context}` },
        { role: 'user', content: userText }
      ]
    });
    const aiText = chat.choices[0].message.content;
    console.log('Respuesta IA:', aiText);

    // 5. TTS ElevenLabs → guardamos WAV directamente
    //    textToSpeech deberá admitir un parámetro de formato WAV
    await textToSpeech(aiText, wavResponsePath);
    console.log('Audio respuesta guardado en WAV:', wavResponsePath);

    // 6. Enviar a Audio2Face headless para animar
    await animateFace(wavResponsePath);

    // 7. Devolver el audio WAV al cliente Unreal
    res.sendFile(wavResponsePath, err => {
      if (err) {
        console.error('Error enviando WAV al cliente:', err);
        res.status(500).json({ error: 'Error enviando audio' });
      }
      // opcional: limpiar temporales
      // fs.unlinkSync(inputPath);
      // fs.unlinkSync(wavRequestPath);
      // fs.unlinkSync(wavResponsePath);
    });

  } catch (err) {
    console.error('Error en /talk:', err);
    res.status(500).json({ error: 'Error en procesamiento de audio' });
  }
}

module.exports = { talk };
