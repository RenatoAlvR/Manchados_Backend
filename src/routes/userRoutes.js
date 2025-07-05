const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Obtener a todos los usuarios
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Crear un nuevo usuario
router.post('/register', async (req, res, next) => {
    const {
        Email, 
        Telefono, 
        Contraseña, 
        Nombre, 
        Apellidos, 
        Direccion, 
        DireccionFactura, 
        Rol
    } = req.body;

    try{
        let user = await User.findOne({Email});
        if(user) {  //Si el usuario ya existe manda error
            return res.status(400).json({message: "Usuario ya existente"});
        }

        user = await User.create({
        Email, 
        Telefono, 
        Contraseña, 
        Nombre, 
        Apellidos, 
        Direccion, 
        DireccionFactura, 
        Rol
        });

        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                Email: user.Email, 
                Telefono: user.Telefono,  
                Nombre: user.Nombre, 
                Apellidos: user.Apellidos, 
                Direccion: user.Direccion, 
                DireccionFactura: user.DireccionFactura, 
                Rol: user.Rol, 
                FechaRegistro: user.FechaRegistro
            }
        });
    } catch(error) {
        console.error("ERROR: ", error);
        if(error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error de servidor' });
    }
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