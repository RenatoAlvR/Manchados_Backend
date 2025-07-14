// src/models/Cart.js
const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    UsuarioAsociadoID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // <-- Mongoose hint for population
        required: true,
        unique: true
    },
    UltimoCambio: {
        type: String,
        default: ''
    },
    ListaItems: [
        {
            ProductoID: { // This should also be ObjectId if you're referencing Product model
                type: mongoose.Schema.Types.ObjectId, // <-- CRITICAL CHANGE: Use ObjectId
                ref: 'Product', // <-- Mongoose hint for population
                required: true
            },
            Cantidad: {
                type: Number,
                required: true,
                min: [1, 'La cantidad no puede ser menor que 1.']
            }
        }
    ]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;