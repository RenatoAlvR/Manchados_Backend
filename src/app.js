//  ..src/app.js
require('dotenv').config(); //Carga las variables del archivo .env, en este caso, el puerto y la URI de la base de datos
const express = require('express');
const logger = require('./middleware/logger');
const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');   //Importa la conexion a la DB

const app =  express();
const port = process.env.port || 3000;

//Uso de middleware global
app.use(logger);    //Recopilara logs sobre las operaciones realizadas (en terminal)
app.use(express.json());    //Todas las res seran JSON basicamente

//Ruta raiz (root)
app.get('/', (req, res) => {
    res.send('Bienvenido a la pagina de Ecommerce de Manchados!');
});

//Rutas (las manejara nuestro Router)
app.use('/api/products', productRoutes);

//Middleware para manejo de errores
//Error 404 - Not Found
app.use((req, res, next) => {
    const error = new Error('Error 404 No Encontrado');
    error.status = 404;
    next(error);
});

//Errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);   //Loggea el error
    res.status(err.status || 500);      //Usar el status del error o 500 por default
    res.json({
        error: {
            message: err.message || 'Mensaje inesperado/No reconocido'
        }
    });
});

//Iniciar el servidor
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
  console.log(`Access root: http://localhost:${port}`);
  console.log(`Test products API: http://localhost:${port}/api/products`);
  console.log(`MongoDB URI loaded: ${process.env.MONGO_URI ? 'Yes' : 'No'}`);
  connectDB();
});