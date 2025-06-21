const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const peliculasController = require('../controllers/peliculas');

// Crear nueva película
router.post('/', [
  check('titulo', 'El título es requerido').not().isEmpty(),
  check('anio', 'El año debe ser un número válido').isInt({ min: 1900, max: 2100 }),
  check('duracion', 'La duración debe ser un número válido en minutos').isInt({ min: 1 }),
  check('calificacion', 'La calificación debe ser entre 0 y 10').isInt({ min: 0, max: 10 }),
  check('sinopsis', 'La sinopsis es requerida').not().isEmpty(),
  check('director', 'El director es requerido').not().isEmpty(),
  check('reparto', 'El reparto es requerido').not().isEmpty(),
  check('generos', 'Debe seleccionar al menos un género').not().isEmpty(),
  check('formatos', 'Debe seleccionar al menos un formato').not().isEmpty()
], peliculasController.crearPelicula);

// Listar todas las películas
router.get('/', peliculasController.listarPeliculas);

// Obtener una película por ID
router.get('/:id', peliculasController.obtenerPelicula);

// Obtener todos los géneros disponibles
router.get('/generos/listado', peliculasController.obtenerGeneros);

// Obtener todos los formatos disponibles
router.get('/formatos/listado', peliculasController.obtenerFormatos);

module.exports = router;