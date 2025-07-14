
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro
exports.registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = user.getSignedJwtToken();

    const newCart = await Cart.create({
      UsuarioAsociadoID: user._id, // <-- THIS IS THE CORRECT LINK!
      ListaItems: [] // Initialize with an empty array of items
    });
    console.log('New cart created for user:', newCart._id); // For debugging

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { Email, Contraseña } = req.body;

  try {
    const user = await User.findOne({ Email }).select('+Contraseña');
    if (!user || !(await user.matchPassword(Contraseña))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = user.getSignedJwtToken();
    res.json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Obtener perfil
exports.getProfile = async (req, res) => {
  res.json(req.user);
};

// NEW FUNCTION: Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        // .select('-password') excludes the password hash from the response for security
        const users = await User.find().select('-password');

        // Send a 200 OK response with the list of users
        res.status(200).json({
            success: true,
            data: users, // Returning the users array under a 'data' key is a common practice
            message: 'Usuarios obtenidos exitosamente.'
        });
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        // Send a 500 Internal Server Error response if something goes wrong
        res.status(500).json({
            success: false,
            message: 'Error del servidor al obtener usuarios.'
        });
    }
};
