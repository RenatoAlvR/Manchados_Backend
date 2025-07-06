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
        min: [0, 'El stock no puede ser negativo.'],
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    }
},{
    timestamps: true    //Automaticamente genera los campos creadoEn y actualizadoEn
});

//Mongoose Middleware "hooks", pasan antes o despues de eventos
productSchema.pre('save', function(next) {  //Antes de guardar, si el nombre fue modificado (put) quita los whitespaces
    if(this.isModified('name')) {
        this.name = this.name.trim();
    }
    next();
});

productSchema.pre('findOneAndUpdate', function(next) {  //Al modificar, al string del nombre actualizado le quita los whitespaces
    const update = this.getUpdate();
    if (update.name) {
        update.name = update.name.trim();
    }
    next();
});

const Product = mongoose.model('Product', productSchema);   //Crear el modelo del producto
module.exports = Product;