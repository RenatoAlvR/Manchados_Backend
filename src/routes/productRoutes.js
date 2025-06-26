// ../routes/productRoutes.js
const express = require('express');
const router = express.Router(); // Crear una instancia de router (maneja rutas para las distintas paginas)
const Product = require('../models/Product'); //Importamos el modelo del objeto Producto

// GET /: Obtener todos los productos
router.get('/', async (req, res) => {
    try{
        const query = {};   //Inicializa el objeto query vacio (este obtendra los filtros segun el req.query enviado)

        //Filtrar por categoria:
        if(req.query.category) {
            query.category = req.query.category;
        }

        //Filtrar el precio minimo y precio maximo (dado que price es solo un campo)
        if(req.query.minPrice || req.query.maxPrice){   //Si existe uno de los dos, entra aca
            query.price = {};
            if(req.query.minPrice){
                query.price.$gte = parseFloat(req.query.minPrice);
            }
            if(req.query.maxPrice){
                query.price.$lte = parseFloat(req.query.maxPrice);  
            }
        }
        let productsQuery = Product.find(query); 
        //Busca en la base de datos, segun el objeto query, en la coleccion Products. Es la traduccion simple de todo esto.
        //productsQuery es la query que recibe Mongo mediante Mongoose, la cual la construimos en JS mediante la variable query
        //esta variable la llenamos con parametros provenientes de la request http

        //Sort, ordenamiento en español (ascendente, descendente, por nombre, por precio, lo tipico)
        if(req.query.sortBy) {
            const parts = req.query.sortBy.split(':'); //Separa el sortBy por parametro, ejemplo "price:desc"
            const field = parts[0];
            const order = (parts[1] === 'desc' || parts [1] === '-1') ? -1 : 1 //1 = ascendiente, -1 = descendiente
            productsQuery = productsQuery.sort({[field]: order});   //Indicar a Mongoose el ordenamiento
        } else{
            productsQuery = productsQuery.sort({createdAt: -1}); //Orden por default: creado recientemente
        }

        //Paginacion (cuantos objetos se muestran por pagina)
        const page = parseInt(req.query.page) || 1; //pagina actual, por defecto la primera
        const limit = parseInt(req.query.limit) || 10; //cantidad de items por pagina, por defecto 10
        const skip = (page - 1) * limit; //Cantidad de items que skipear

        productsQuery = productsQuery.skip(skip).limit(limit);  //actualizar la query para mongoose

        const products = await productsQuery.exec();    //Ejecuta la query y retorna los items correspondientes desde la DB

        const totalProducts = await Product.countDocuments(query);  //Obtiene la cantidad total de items que cumplen con la query
        const totalPages = Math.ceil(totalProducts/limit);  //Calcula la cantidad total de paginas

        res.json({      //Respuesta que envia el server en formato JSON
            products,
            page,
            limit,
            totalPages,
            totalProducts
        });
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
            res.json(product);
        } else{
            res.status(404).json({message: 'Error 404 Producto No Encontrado.'});
        }
    } catch(error){
        if(error.name === 'CastError') {
            return res.status(400).json({message: 'Formato de ID de producto invalido.'});
        }
        console.error(error);
        res.status(500).json({message: 'Error obteniendo el producto.'});
    }
});

// POST /: Crear un nuevo producto/recurso
router.post('/', async (req, res) => {
    try{
        const newProduct = new Product(req.body); //Crea el producto nuevo segun la data del req.body
        const savedProduct = await newProduct.save();     //Lo guarda en la DB (se activa el hook pre save tambien)
        res.status(201).json(savedProduct);
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
            new: true,   //retorna el documento actualizado
            runValidators: true     //Obliga a que siga el Schema
        });
        if(updatedProduct){
            res.json(updatedProduct);
        } else{
            res.status(404).json({message: 'Producto no encontrado, no se puede modificar.'});
        }
    } catch(error){
        if(error.name === 'CastError') {
            return res.status(400).json({message: 'Formato de ID invalido.'});
        }
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
        if(error.name === 'castError') {
            return res.status(400).json({message: 'Formato de ID invalido.'});
        }
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto.' });
    }
});

module.exports = router; //Exporta el router