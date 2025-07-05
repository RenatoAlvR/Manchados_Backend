
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro
exports.registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = user.getSignedJwtToken();
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
