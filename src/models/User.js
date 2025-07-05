// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //Para el hasheo de contraseñas
const jwt = require('jsonwebtoken');    //Para generar tokens

const userSchema = mongoose.Schema({
    Email: {
        type: String,
        required: [true, 'Por favor ingresa un correo electrónico.'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Por favor ingresa un correo valido.']  //Verifica que el correo no tenga caracteres invalidos
    },
    Telefono: {
        type: String,
        default: ''
    },
    Contraseña: {
        type: String,
        required: [true, 'Por favor ingresa una contraseña.'],
        select: false // Cuando pidamos un usuario, no devolvera la contraseña
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
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.pre('save', function(next) {
    if (this.isModified('Nombre') || this.isModified('Apellidos')) {
        this.Nombre = this.Nombre.trim();
        this.Apellidos = this.Apellidos.trim();
    }
    next();
});

userSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.Nombre || update.Apellidos) {
        update.Nombre = update.Nombre.trim();
        update.Apellidos = update.Apellidos.trim();
    }
    next();
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('Contraseña')) {   //Si no esta modificada o nueva, no hace nada
        next();
    }
    //La "sal" asegura que cada hash sea unico, en caso de que haya dos contraseñas iguales
    const salt = await bcrypt.genSalt(10);  //Genera la "sal", mayor factor de costo = mas segura pero mas lento
    this.Contraseña = await bcrypt.hash(this.Contraseña, salt); //Genera el hash + sal
    next();
});

userSchema.methods.getSignedJwtToken = function() {     //Genera el token JWT
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

userSchema.methods.matchPassword = async function(ContraseñaIngresada) {
    return await bcrypt.compare(ContraseñaIngresada, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;