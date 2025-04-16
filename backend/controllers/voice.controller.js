const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";

const handleVoiceInput = async (req, res) => {
  try {
    const audioPath = req.file.path;

    // Paso 1: STT con Whisper
    const transcription = await openai.createTranscription(
      fs.createReadStream(audioPath),
      "whisper-1"
    );
    const userText = transcription.data.text;

    // Paso 2: Obtener contexto desde RAG
    const ragRes = await axios.post(`${RAG_SERVICE_URL}/rag/query`, {
      query: userText,
    });
    const context = ragRes.data.context || "";

    // Paso 3: Generar respuesta con OpenAI
    const prompt = `
Usá el siguiente contexto para responder como un amigo real.

CONTEXT:
${context}

USUARIO:
${userText}

RESPUESTA:
`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.7,
      max_tokens: 300,
    });

    const ivanReply = completion.data.choices[0].text.trim();

    // Paso 4: Text-to-Speech con ElevenLabs
    const voiceId = "EXAVITQu4vr4xnSDxMaL"; // o tu voz personalizada
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: ivanReply,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const audioOutputPath = `uploads/response_${Date.now()}.mp3`;
    fs.writeFileSync(audioOutputPath, ttsResponse.data);

    // Paso 5: Responder
    res.set("Content-Type", "application/json");
    res.json({
      inputText: userText,
      ivanReply,
      audioUrl: `/audio/${path.basename(audioOutputPath)}`
    });

    // Elimina el archivo de entrada
    fs.unlink(audioPath, () => {});
  } catch (error) {
    console.error("Error en voz:", error.message);
    res.status(500).json({ error: "Error procesando el audio" });
  }
};

module.exports = { handleVoiceInput };
