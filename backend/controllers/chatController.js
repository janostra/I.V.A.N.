const { generateResponse } = require('../services/openaiservice');
const { getUserConversation, saveUserMessage } = require('../memory/conversationMemory');
const { textToSpeech } = require('../services/elevenlabsService');

async function chatWithIvan(req, res) {
  const { userId, userMessage } = req.body;

  if (!userId || !userMessage) {
    return res.status(400).json({ error: 'Faltan userId o userMessage.' });
  }

  try {
    const history = await getUserConversation(userId);

    const messages = [
      { role: 'system', content: 'Actuás como un amigo real, empático, gracioso, que conoce la vida del usuario. Sos I.V.A.N.' },
      ...history,
      { role: 'user', content: userMessage }
    ];

    const ivanReply = await generateResponse(messages);

    // Guardar los mensajes en memoria
    await saveUserMessage(userId, { role: 'user', content: userMessage });
    await saveUserMessage(userId, { role: 'assistant', content: ivanReply });

    // Generar audio
    const audioFileName = `ivan-${Date.now()}.mp3`;
    const audioUrl = await textToSpeech(ivanReply, audioFileName);

    return res.json({ 
      text: ivanReply,
      audioUrl
    });

  } catch (error) {
    console.error('Error en chatWithIvan:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { chatWithIvan };
