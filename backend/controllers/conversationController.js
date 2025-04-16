const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RAG_SERVICE_URL = "http://localhost:8001"; // Microservicio RAG

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const askIvan = async (req, res) => {
  const { userInput } = req.body;

  try {
    // Paso 1: Consultar al RAG
    const ragResponse = await axios.post(`${RAG_SERVICE_URL}/rag/query`, {
      query: userInput,
    });

    const context = ragResponse.data.context || "";

    // Paso 2: Crear el prompt para OpenAI con contexto
    const prompt = `
Eres I.V.A.N, un amigo inteligente y empático. Usá el siguiente contexto para responder lo mejor posible.

CONTEXT:
${context}

USER SAYS:
${userInput}

I.V.A.N RESPONDS:
`;

    // Paso 3: Llamar a OpenAI
    const openaiResponse = await openai.createCompletion({
      model: "text-davinci-003", // o "gpt-4", si usás chat/completions
      prompt,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = openaiResponse.data.choices[0].text.trim();

    res.json({ reply });
  } catch (err) {
    console.error("Error en conversación:", err.message);
    res.status(500).json({ error: "Error generando respuesta" });
  }
};

module.exports = {
  askIvan,
};
