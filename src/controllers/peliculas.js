const Pelicula = require('../models/Pelicula');
const { validationResult } = require('express-validator');

exports.crearPelicula = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pelicula = await Pelicula.crear(req.body);
    res.status(201).json(pelicula);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la película' });
  }
};

exports.listarPeliculas = async (req, res) => {
  try {
    const peliculas = await Pelicula.listar();
    res.json(peliculas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar películas' });
  }
};

exports.obtenerPelicula = async (req, res) => {
  try {
    const pelicula = await Pelicula.buscarPorId(req.params.id);
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    res.json(pelicula);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la película' });
  }
};

exports.obtenerGeneros = async (req, res) => {
  try {
    const generos = await Pelicula.obtenerGeneros();
    res.json(generos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
};

exports.obtenerFormatos = async (req, res) => {
  try {
    const formatos = await Pelicula.obtenerFormatos();
    res.json(formatos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener formatos' });
  }
};