const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Obtener todos los carritos
router.get('/', async (req, res) => {
    const carritos = await Cart.find();
    res.json(carritos);
});

// Crear nuevo carrito
router.post('/', async (req, res) => {
    const nuevoCarrito = new Cart(req.body);
    const carritoGuardado = await nuevoCarrito.save();
    res.json(carritoGuardado);
});

// Actualizar carrito por ID
router.patch('/:id', async (req, res) => {
    const carritoActualizado = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(carritoActualizado);
});

// Eliminar carrito por ID
router.delete('/:id', async (req, res) => {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Carrito eliminado' });
});

module.exports = router;