const Funcion = require('../models/Funcion');
const { validationResult } = require('express-validator');

exports.crearFuncion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { peliculaId, sucursalId, salaId, fecha, horarios, formato, idioma } = req.body;
        
        // Verificar que horarios es un array
        const horariosArray = Array.isArray(horarios) ? horarios : [horarios];

        if (horariosArray.length === 0) {
            return res.status(400).json({ error: 'Debe proporcionar al menos un horario' });
        }

        const funciones = await Funcion.crear({
            peliculaId,
            sucursalId,
            salaId,
            fecha,
            horarios: horariosArray,
            formato,
            idioma
        });

        res.status(201).json({
            message: 'Funciones creadas exitosamente',
            data: funciones
        });
    } catch (error) {
        console.error('Error en crearFuncion:', error);
        
        if (error.message === 'Película no encontrada') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Formato no disponible para esta película') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Sala no encontrada') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Ya existe una función')) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Error al crear la función' });
    }
};

exports.listarPorPelicula = async (req, res) => {
    try {
        const { peliculaId } = req.params;
        const funciones = await Funcion.listarPorPelicula(peliculaId);
        res.json({
            message: 'Funciones obtenidas exitosamente',
            data: funciones
        });
    } catch (error) {
        console.error('Error en listarPorPelicula:', error);
        res.status(500).json({ error: 'Error al listar funciones' });
    }
};

exports.listarPorSucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;
        const funciones = await Funcion.listarPorSucursal(sucursalId);
        res.json({
            message: 'Funciones obtenidas exitosamente',
            data: funciones
        });
    } catch (error) {
        console.error('Error en listarPorSucursal:', error);
        res.status(500).json({ error: 'Error al listar funciones' });
    }
};

exports.obtenerSalasDisponibles = async (req, res) => {
    try {
        const { sucursalId, fecha, hora } = req.query;
        
        if (!sucursalId || !fecha || !hora) {
            return res.status(400).json({ 
                error: 'Los parámetros sucursalId, fecha y hora son requeridos' 
            });
        }

        const salas = await Funcion.obtenerSalasDisponibles(sucursalId, fecha, hora);
        res.json({
            message: 'Salas disponibles obtenidas exitosamente',
            data: salas
        });
    } catch (error) {
        console.error('Error en obtenerSalasDisponibles:', error);
        res.status(500).json({ error: 'Error al obtener salas disponibles' });
    }
};

exports.obtenerFuncion = async (req, res) => {
    try {
        const { id } = req.params;
        const funcion = await Funcion.obtenerPorId(id);
        
        if (!funcion) {
            return res.status(404).json({ error: 'Función no encontrada' });
        }
        
        res.json({
            message: 'Función obtenida exitosamente',
            data: funcion
        });
    } catch (error) {
        console.error('Error en obtenerFuncion:', error);
        res.status(500).json({ error: 'Error al obtener la función' });
    }
};

exports.obtenerSalasPorSucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;
        const salas = await Funcion.obtenerSalasPorSucursal(sucursalId);
        res.json({
            message: 'Salas obtenidas exitosamente',
            data: salas
        });
    } catch (error) {
        console.error('Error en obtenerSalasPorSucursal:', error);
        res.status(500).json({ error: 'Error al obtener salas' });
    }
};