// src/models/Cart.js
const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    CarritoID: {
        type: Number,
        required: true,
        unique: true
    },
    UsuarioAsociadoID: {
        type: Number,
        required: true
    },
    UltimoCambio: {
        type: String,
        default: ''
    },
    ListaItems: [
        {
            ProductoID: {
                type: Number,
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