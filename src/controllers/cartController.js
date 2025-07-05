
const Cart = require('../models/Cart');

// Agregar producto al carrito
exports.addToCart = async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
};

// Eliminar producto del carrito
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar del carrito' });
  }
};

// Actualizar cantidad
exports.updateCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Producto no encontrado en el carrito' });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar cantidad' });
  }
};

// Vaciar carrito
exports.emptyCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.items = [];
    await cart.save();
    res.json({ message: 'Carrito vaciado', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al vaciar carrito' });
  }
};

// Obtener carrito de un usuario
exports.getCartByUser = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
};

// Obtener todos los carritos (admin)
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate('items.productId');
    res.json(carts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener todos los carritos' });
  }
};
