require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const driver = require('./config/neo4j');

const peliculasRouter = require('./routes/peliculas');
const funcionesRouter = require('./routes/funciones');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api/peliculas', peliculasRouter);
app.use('/api/funciones', funcionesRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Cerrar conexión a Neo4j al apagar el servidor
process.on('SIGINT', async () => {
  await driver.close();
  server.close(() => {
    console.log('Servidor y conexión a Neo4j cerrados');
    process.exit(0);
  });
});

module.exports = app;