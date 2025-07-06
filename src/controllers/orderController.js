const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener órdenes' });
  }
};

exports.createOrder = async (req, res) => {
  const nuevaOrden = req.body;

  try {
    // Validar stock producto por producto
    for (const item of nuevaOrden.ItemsOrdenados) {
      const producto = await Product.findOne({ ProductoID: item.ProductoID });

      if (!producto) {
        return res.status(404).json({ message: `Producto ID ${item.ProductoID} no encontrado` });
      }

      if (producto.stock < item.Cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente para "${producto.name}". Disponible: ${producto.stock}, solicitado: ${item.Cantidad}`
        });
      }
    }

    // Descontar stock de cada producto
    for (const item of nuevaOrden.ItemsOrdenados) {
      await Product.findOneAndUpdate(
        { ProductoID: item.ProductoID },
        { $inc: { stock: -item.Cantidad } }
      );
    }

    // Guardar orden
    const orden = await Order.create(nuevaOrden);
    res.status(201).json({ message: 'Orden creada y stock actualizado', orden });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear orden', error });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener orden' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Orden eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar orden' });
  }
};
