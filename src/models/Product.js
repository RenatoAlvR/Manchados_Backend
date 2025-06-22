//  src/models/Product.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor ingresa el nombre del producto.']
    },
    price: {
        type: Number,
        required: [true, 'Por favor ingresa el precio del producto.'],
        min: [0, 'El precio no puede ser menor a 0.']
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Por favor ingresa la categoria del producto.'],
        enum: {     //Validacion, la categoria DEBE ser una de las siguientes
            values: ['Electronicos', 'Ropa', 'Libros', 'Hogar', 'Otro'],
            message: `{VALUE} no es una categoria valida.`
        }
    },
    stock: {
        type: Number,
        required: [true, 'Por favor ingresa la cantidad disponible del producto.'],
        min: [0, 'El stock no puede ser negativo, imbecil.'],
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    }
},{
    timestamps: true    //Automaticamente genera los campos creadoEn y actualizadoEn
});

const Product = mongoose.model('Product', productSchema, 'Productos');   //Crear el modelo del producto
module.exports = Producto;