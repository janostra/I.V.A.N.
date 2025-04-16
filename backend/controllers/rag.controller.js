const axios = require("axios");

const RAG_SERVICE_URL = "http://localhost:8001"; // Asegurate de que el microservicio esté corriendo

const uploadText = async (req, res) => {
  const { userId, text } = req.body;
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/rag/upload-text`, {
      user_id: userId,
      text,
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error al subir texto al RAG:", err.message);
    res.status(500).json({ error: "Error al conectar con RAG" });
  }
};

const queryText = async (req, res) => {
  const { query } = req.body;
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/rag/query`, {
      query,
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error al consultar RAG:", err.message);
    res.status(500).json({ error: "Error al conectar con RAG" });
  }
};

module.exports = {
  uploadText,
  queryText,
};
