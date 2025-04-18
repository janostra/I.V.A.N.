const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const chatRoutes = require('./routes/chatRoutes');
const audioRoutes = require('./routes/audioRoutes');
const ragRoutes = require("./routes/rag.routes");
const sttRoutes = require("./routes/stt.routes");
const path = require("path");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api', chatRoutes);
app.use('/api', audioRoutes);
app.use("/api", ragRoutes);
app.use("/api", sttRoutes);
app.use("/audio", express.static(path.join(__dirname, "uploads")));



// Rutas (acá se agregarán más)
app.get('/', (req, res) => {
  res.send('I.V.A.N Backend funcionando.');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Conectado a MongoDB');
  app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
  });
})
.catch(err => console.error('Error de conexión a MongoDB:', err));
