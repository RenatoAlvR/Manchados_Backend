// src/models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    UsuarioID: {
        type: Number,
        required: true,
        unique: true
    },
    Email: {
        type: String,
        required: [true, 'Por favor ingresa un correo electrónico.'],
        unique: true
    },
    Telefono: {
        type: String,
        default: ''
    },
    Contraseña: {
        type: String,
        required: [true, 'Por favor ingresa una contraseña.']
    },
    Nombre: {
        type: String,
        required: [true, 'Por favor ingresa el nombre.']
    },
    Apellidos: {
        type: String,
        required: [true, 'Por favor ingresa los apellidos.']
    },
    Direccion: {
        type: String,
        default: ''
    },
    DireccionFactura: {
        type: String,
        default: ''
    },
    Rol: {
        type: String,
        enum: ['cliente', 'admin'],
        default: 'cliente'
    },
    FechaRegistro: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

userSchema.pre('save', function(next) {
    if (this.isModified('Nombre')) {
        this.Nombre = this.Nombre.trim();
    }
    next();
});

userSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.Nombre) {
        update.Nombre = update.Nombre.trim();
    }
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;