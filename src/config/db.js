//  src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useCreateIndex: true,         No la soporta esta version pero dejar en caso de
            //useFindAndModify: false       No la soporta esta version pero dejar en caso de
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);    //Salir del proceso con error
    }
};

module.exports = connectDB;