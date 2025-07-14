// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    FechaOrden: {
        type: String,
        default: ''
    },
    PrecioTotal: {
        type: Number,
        required: true
    },
    DireccionEnvio: {
        type: String,
        required: true
    },
    DireccionFactura: {
        type: String,
        default: ''
    },
    Pago: {
        type: Boolean,
        default: false
    },
    MetodoPago: {
        type: String,
        enum: ['tarjeta', 'transferencia', 'efectivo'],
        required: true
    },
    EstadoOrden: {
        type: String,
        enum: ['pendiente', 'en preparación', 'enviado', 'entregado'],
        default: 'pendiente'
    },
    ItemsOrdenados: [
        {
            ProductoID: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            Cantidad: {
                type: Number,
                required: true
            },
            Subtotal: {
                type: Number,
                required: true
            }
        }
    ],
    UsuarioID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;