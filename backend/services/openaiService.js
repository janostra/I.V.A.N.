const axios = require('axios');

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json'
  }
});

async function generateResponse(messages) {
  try {
    const response = await openai.post('/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error al generar respuesta con OpenAI:', error.response?.data || error.message);
    throw new Error('No se pudo generar la respuesta de I.V.A.N.');
  }
}

module.exports = { generateResponse };
