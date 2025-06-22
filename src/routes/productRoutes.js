// ../routes/productRoutes.js
const express = require('express');
const router = express.Router(); // Crear una instancia de router (maneja rutas para las distintas paginas)
const Product = require('../models/Product'); //Importamos el modelo del objeto Producto

// GET /: Obtener todos los productos
router.get('/', async (req, res) => {
    try{
        const products = await Product.find({});  //Obtiene todos los productos disponibles
        res.json(products);
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Error obteniendo los productos.'});
    }
});

// GET /:id: Obtener un solo producto segun Id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByID(req.params.id);    //Obtiene el producto segun su ID
        if(product){
            res.json(producto);
        } else{
            res.status(404).json({message: 'Error 404 Producto No Encontrado.'});
        }

    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Error obteniendo el producto.'});
    }
});

// POST /: Crear un nuevo producto/recurso
router.post('/', async (req, res) => {
    try{
        const newProduct = new Product(req.body); //Crea el producto nuevo segun la data del req.body
        const savedProduct = await newProduct.save();     //Lo guarda en la DB
        res.status(201).json(savedProducto);

    } catch(error){
        console.error(error);
        if(error.name === 'ValidationError'){
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: 'Error creando el producto'});
    }
});

// PUT /:id: Actualiza los datos de un producto (todos los datos)
router.put('/:id', async (req, res) => {
    try{
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new:true,   //retorna el documento actualizado
            runValidators: true     //Obliga a que siga el Schema
        });
        if(updatedProduct){
            res.json(updatedProduct);
        } else{
            res.status(404).json({message: 'Producto no encontrado, no se puede modificar.'});
        }
    } catch(error){
        console.error(error);
        if(error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: 'Error al actualizar el producto.'});
    }
});

// DELETE /:id: Elimina un producto
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (deletedProduct) {
            res.status(204).send(); // Codigo 204, se elimino con exito
        } else {
            res.status(404).json({ message: 'Producto no encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto.' });
    }
});

module.exports = router; //Exporta el router