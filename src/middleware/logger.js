//../middleware/logger.js
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();     //Le da el pase al siguiente middleware o ruta
};

module.exports = logger;    //Exporta la funcion middleware