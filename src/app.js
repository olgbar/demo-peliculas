// app.js
const express = require('express');
const bodyParser = require('body-parser');
const rutasCines = require('./rutas/cines_rutas');
const rutasSucursales = require('./rutas/sucursales_rutas');
const manejadorErrores = require('./utils/manejador_errores');
const rutasReportes = require('./rutas/reportes_rutas');
const rutasPeliculas = require('./rutas/peliculas_rutas');
const rutasSalas = require('./rutas/salas_rutas');

require('dotenv').config(); // Cargar variables de entorno

const aplicacion = express();
const puerto = process.env.PUERTO || 3000; // Usar variable de entorno o 3000 por defecto

aplicacion.use(bodyParser.json());

// Rutas
aplicacion.use('/cines', rutasCines);
aplicacion.use('/sucursales', rutasSucursales);
aplicacion.use('/reportes', rutasReportes);
aplicacion.use('/peliculas', rutasPeliculas);
aplicacion.use('/salas', rutasSalas);

// Middleware de manejo de errores
aplicacion.use(manejadorErrores);

aplicacion.listen(puerto, () => {
  console.log(`Microservicio de cines escuchando en el puerto ${puerto}`);
});