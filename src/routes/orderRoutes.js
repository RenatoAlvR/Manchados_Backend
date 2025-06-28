const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Obtener todas las órdenes
router.get('/', async (req, res) => {
    const ordenes = await Order.find();
    res.json(ordenes);
});

// Crear nueva orden
router.post('/', async (req, res) => {
    const nuevaOrden = new Order(req.body);
    const ordenGuardada = await nuevaOrden.save();
    res.json(ordenGuardada);
});

// Actualizar orden por ID
router.patch('/:id', async (req, res) => {
    const ordenActualizada = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ordenActualizada);
});

// Eliminar orden por ID
router.delete('/:id', async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Orden eliminada' });
});

module.exports = router;