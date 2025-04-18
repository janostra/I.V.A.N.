const fs = require("fs");
const fsPromises = require("fs/promises");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

async function transcribeAudio(req, res) {
  const filePath = req.file.path;

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    // Eliminamos el archivo luego de usarlo
    await fsPromises.unlink(filePath);

    res.json({ text: transcription.text });
  } catch (error) {
    console.error("Error en STT:", error);

    // Intentar eliminar archivo incluso si falló la transcripción
    try {
      await fsPromises.unlink(filePath);
    } catch (err) {
      console.error("Error al eliminar el archivo:", err);
    }

    res.status(500).json({ error: "Error al transcribir audio" });
  }
}

module.exports = {
    transcribeAudio,
  };