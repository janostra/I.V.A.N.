// a2fHeadlessClient.js
const axios = require('axios');
const fs = require('fs');

const A2F = 'http://localhost:8011';

// 1) Cargar el archivo WAV en el servidor headless
async function uploadAudio(filePath) {
  const data = fs.readFileSync(filePath);
  await axios.post(`${A2F}/file/upload`, data, { headers: { 'Content-Type': 'audio/wav' } });
}

// 2) Configurar la pista para reproducción
async function setTrack(fileName) {
  await axios.post(`${A2F}/A2F/Player/SetTrack`, { filepath: `/tmp/${fileName}` });
}

// 3) Iniciar playback y animación
async function playAudio() {
  await axios.post(`${A2F}/A2F/Player/Play`);
}

// Orquesta todo
module.exports = async function animateFace(filePath) {
  const fileName = filePath.split(/[\\/]/).pop();
  await uploadAudio(filePath);
  await setTrack(fileName);
  await playAudio();
  console.log('✅ Audio enviado y animación iniciada en headless Audio2Face');
};
