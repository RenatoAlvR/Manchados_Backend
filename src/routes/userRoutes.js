const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Obtener a todos los usuarios
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    const nuevoUsuario = new User(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    res.json(usuarioGuardado);
});

// Actualizar usuario por ID
router.patch('/:id', async (req, res) => {
    const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(usuarioActualizado);
});

// Eliminar usuario por ID
router.delete('/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Usuario eliminado' });
});

module.exports = router;