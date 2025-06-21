const express = require('express');
const router = express.Router();
const { check, query } = require('express-validator');
const funcionesController = require('../controllers/funciones');

// Crear nueva función (o múltiples funciones para diferentes horarios)
router.post('/', [
    check('peliculaId', 'El ID de la película es requerido').not().isEmpty(),
    check('sucursalId', 'El ID de la sucursal es requerido').not().isEmpty(),
    check('salaId', 'El ID de la sala es requerido').not().isEmpty(),
    check('fecha', 'La fecha es requerida').not().isEmpty(),
    check('fecha', 'La fecha debe estar en formato YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
    check('horarios', 'Debe proporcionar al menos un horario').not().isEmpty(),
    check('formato', 'El formato es requerido').not().isEmpty(),
    check('formato', 'El formato debe ser 2D, 3D o IMAX').isIn(['2D', '3D', 'IMAX']),
    check('idioma', 'El idioma es requerido').not().isEmpty(),
    check('idioma', 'El idioma debe ser válido').isIn(['Español', 'Subtitulado', 'Inglés'])
], funcionesController.crearFuncion);

// Obtener función por ID
router.get('/:id', funcionesController.obtenerFuncion);

// Listar funciones por película
router.get('/pelicula/:peliculaId', funcionesController.listarPorPelicula);

// Listar funciones por sucursal (ID de sucursal en MySQL)
router.get('/sucursal/:sucursalId', funcionesController.listarPorSucursal);

// Obtener salas disponibles para una sucursal, fecha y hora
router.get('/salas-disponibles', [
    query('sucursalId', 'El ID de la sucursal es requerido').not().isEmpty(),
    query('fecha', 'La fecha es requerida').not().isEmpty(),
    query('fecha', 'La fecha debe estar en formato YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
    query('hora', 'La hora es requerida').not().isEmpty(),
    query('hora', 'La hora debe estar en formato HH:MM').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], funcionesController.obtenerSalasDisponibles);


router.get('/salas/sucursal/:sucursalId', funcionesController.obtenerSalasPorSucursal);

module.exports = router;