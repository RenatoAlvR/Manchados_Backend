const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {protect, authorize} = require('../middleware/auth');

/*
// Obtener a todos los usuarios
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});
*/

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

router.post('/login', async (req, res) => {
    const {Email, Contraseña} = req.body;
    console.log(Contraseña);
    //Validar que obtuvimos correctamente los datos
    if(!Email || !Contraseña) {
        return res.status(400).json({message: "Por favor ingresar email y contraseña"});
    }

    try{
        //Checkear si el usuario es valido
        const user =  await User.findOne({Email}).select('+Contraseña');
        //El +password es para obtener la contraseña y compararla, ya que por defecto no saldrá en las consultas

        //Si el usuario no existe o el hash no coincide, se invalida el logeo
        if(!user || !(await user.matchPassword(Contraseña))) {
            return res.status(401).json({message: "Credenciales Invalidas :("});
        }

        //Si las credenciales son validas, se genera JWT
        const token = user.getSignedJwtToken();

        //Enviar la respuesta
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                Nombre: user.Nombre,
                Email: user.Email,
                Rol: user.Rol
            }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message: "Error del servidor durante intento de login :("});
    }
});

router.get('/me', protect, async (req, res, next) => {
    try {
        //req.user viene desde el middleware "protect"
        const user = req.user;
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                Name: user.Name,
                Email: user.Email,
                Rol: user.Rol,
                FechaRegistro: user.FechaRegistro
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error de servidor al buscar el perfil' });
    }
});

//Ruta sólo para usuarios admin: obtener TODOS los usuarios
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        //Obtener todos los usuarios SIN sus contraseñas
        const users = await User.find().select('-Contraseña');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener todos los usuarios como admin' });
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