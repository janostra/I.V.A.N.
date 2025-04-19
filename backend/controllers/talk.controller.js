const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { OpenAI } = require('openai');
const { textToSpeech } = require('../services/elevenlabsService'); // Ajusta la ruta si es necesario

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const talk = async (req, res) => {
  const inputPath = req.file.path;  // Archivo enviado en audio/request/
  const convertedPath = path.join(__dirname, '..', 'audio', 'request', `${Date.now()}.mp3`);

  try {
    // 1. Convertir audio a mp3
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(convertedPath);
    });

    // 2. Transcripción con Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(convertedPath),
      model: 'whisper-1',
    });
    const userText = transcription.text;
    console.log('Usuario dijo:', userText);

    // 3. Obtener contexto vía RAG
    const ragResponse = await axios.post('http://localhost:8001/rag/query', { query: userText });
    const context = ragResponse.data.context;
    console.log('Contexto RAG:', context);

    // 4. Respuesta de GPT-4 incluyendo contexto
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `Contexto relevante:\n${context}` },
        { role: 'user', content: userText }
      ]
    });
    const aiResponse = completion.choices[0].message.content;
    console.log('Respuesta IA:', aiResponse);

    // 5. TTS con ElevenLabs
    const responseDirectory = path.join(__dirname, '..', 'audio', 'response');
    if (!fs.existsSync(responseDirectory)) fs.mkdirSync(responseDirectory, { recursive: true });

    const audioRelativePath = await textToSpeech(aiResponse); // Guarda en audio/response
    console.log('Audio generado en:', audioRelativePath);
    const audioAbsolutePath = path.join(__dirname, '..', audioRelativePath);

    // 6. Enviar audio al cliente
    res.sendFile(audioAbsolutePath, err => {
      if (err) {
        console.error('Error al enviar archivo:', err);
        return res.status(500).json({ error: 'Error al enviar audio' });
      }
      // Opcional: limpieza de temporales si lo deseas
      // fs.unlinkSync(inputPath);
      // fs.unlinkSync(convertedPath);
      // fs.unlinkSync(audioAbsolutePath);
    });

  } catch (err) {
    console.error('Error en /talk:', err);
    res.status(500).json({ error: 'Error al procesar la conversación' });
  }
};

module.exports = { talk };
