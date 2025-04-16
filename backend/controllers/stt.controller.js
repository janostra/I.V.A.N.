const fs = require("fs");
const path = require("path");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const transcribeAudio = async (req, res) => {
  try {
    const audioPath = req.file.path;

    const response = await openai.createTranscription(
      fs.createReadStream(audioPath),
      "whisper-1"
    );

    // Elimina el archivo temporal
    fs.unlink(audioPath, () => {});

    res.json({ text: response.data.text });
  } catch (err) {
    console.error("Error en STT:", err.message);
    res.status(500).json({ error: "Error al transcribir audio" });
  }
};

module.exports = {
  transcribeAudio,
};
