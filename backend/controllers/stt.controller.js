const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcribeAudio = async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, '..', 'uploads', `${Date.now()}.mp3`);


  try {
    // Convertir el audio a MP3 (puede ser WAV también)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3') // podés usar 'wav' si preferís
        .on('error', reject)
        .on('end', resolve)
        .save(outputPath);
    });

    // Enviar el audio convertido a Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: 'whisper-1',
    });

    // Limpiar archivos temporales
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Error en STT:', error);
    res.status(500).json({ error: 'Error al procesar el audio' });
  }
};

module.exports = { transcribeAudio };
