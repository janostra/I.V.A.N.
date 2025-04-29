const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Ruta del directorio donde se guardan los archivos de audio
const audioDirectory = "C:/Users/Jano/Desktop/I.V.A.N/backend/audio/request";

// URL del backend donde deseas enviar el archivo
const uploadUrl = "http://localhost:5000/api/talk";

let watcher; // Variable global para poder detener y reanudar

// Función para limpiar la carpeta
const cleanAudioDirectory = () => {
  const files = fs.readdirSync(audioDirectory);
  files.forEach(file => {
    const filePath = path.join(audioDirectory, file);
    fs.unlinkSync(filePath);
  });
  console.log('Carpeta limpiada');
};

// Función para enviar el archivo
const sendAudioToBackend = async (filePath) => {
  try {
    // Detener la vigilancia temporalmente para evitar eventos duplicados
    watcher.unwatch(audioDirectory);
    console.log('Vigilancia detenida temporalmente');

    // Enviar el archivo
    const form = new FormData();
    form.append('audio', fs.createReadStream(filePath), {
      filename: path.basename(filePath),  // mantener el nombre real
      contentType: 'audio/wav',
    });

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      responseType: 'arraybuffer',
    });

    console.log('Archivo enviado correctamente:', response.data.length);

    // Luego de enviar, limpiar la carpeta
    cleanAudioDirectory();

  } catch (error) {
    console.error('Error al enviar el archivo:', error.message);
  } finally {
    // Reanudar la vigilancia
    watcher.add(audioDirectory);
    console.log('Vigilancia reanudada');
  }
};

// Inicializar el watcher
watcher = chokidar.watch(audioDirectory, {
  persistent: true,
  ignored: /^\./,  // Ignorar archivos ocultos
  ignoreInitial: true,  // No ejecutar acción sobre archivos existentes
});

watcher.on('add', (filePath) => {
  console.log('Nuevo archivo detectado:', filePath);
  sendAudioToBackend(filePath); 
});

console.log("Monitoreando el directorio para nuevos archivos de audio...");
