const { textToSpeech } = require('../services/elevenlabsService');

async function generateAudio(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto requerido.' });

  try {
    const audioPath = await textToSpeech(text);
    return res.json({ audioUrl: audioPath });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { generateAudio };
