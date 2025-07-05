//  ./src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); //Necesitamos saber como esta conformado un usuario 

//Middleware para proteger (autentificar) las rutas (que queramos)
const protect = async (req, res, next) => {
    let token;

    //Revisar si el header de autorización existe y ver el campo 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //Extrae el token desde el campo "Bearer"
        token = req.headers.authorization.split(' ')[1];
    }

    //En caso de que no encuentre el token JWT
    if (!token) {
        return res.status(401).json({ message: 'No existe token, no está autorizado para esta ruta' });
    }

    try {
        //Verificar token (segun la variable JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Pegar usuario al req (exceptuando la contraseña, obvio)
        req.user = await User.findById(decoded.id).select('-Password');

        //En caso de que no se encuentre el usuario (por X razón)
        if (!req.user) {
            return res.status(401).json({ message: 'No autorizado, no se encontró el usuario' });
        }

        next();

    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'No autorizado, token invalido o no existente :)' });
        }
        res.status(500).json({ message: 'Sin autorizar, falló la verificación de token' });
    }
};

//Middleware para autorizar roles de usuarios
const authorize = (...Roles) => { //Toma un array de posibles roles
    return (req, res, next) => {
        //Checkea si el rol del usuario actual está dentro de los roles permitidos para esta ruta
        if (!Roles.includes(req.user.Rol)) {
            return res.status(403).json({//403 acceso denegado/prohibido
                message: `Rol de usuario: ${req.user.Rol} no está autorizado para acceder acá`
            });
        }
        next();//Usuario autorizado, prosiga con su vida :)
    };
};

module.exports = {protect, authorize};