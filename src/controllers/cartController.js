
const Cart = require('../models/Cart');
const Product = require('../models/Product'); 

const getAuthenticatedUserId = (req) => {
    // Assuming 'protect' middleware adds req.user and it has _id
    if (req.user && req.user._id) {
        return req.user._id;
    }
    // Fallback for debugging or if specific routes pass it as param/body directly
    // but prefer req.user for security.
    return req.params.userId || req.body.userId; // Less secure for identifying current user
};

// Agregar producto al carrito
exports.addToCart = async (req, res) => {
  // Use req.user._id for the authenticated user, and req.body for product details
  const userId = getAuthenticatedUserId(req); // Get user ID from authenticated request
  const { ProductoID, Cantidad = 1 } = req.body; // Match schema field names

  if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
  }
  if (!ProductoID || !Cantidad) {
      return res.status(400).json({ message: 'ProductoID y Cantidad son requeridos.' });
  }
  if (Cantidad < 1) {
      return res.status(400).json({ message: 'La cantidad no puede ser menor que 1.' });
  }

  try {
    // Optional: Validate if product exists and is available
    const product = await Product.findById(ProductoID);
    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    // Consider checking stock: if (product.stock < Cantidad) { return res.status(400).json(...) }

    let cart = await Cart.findOne({ UsuarioAsociadoID: userId }); // Match schema field name

    if (!cart) {
      // If no cart, create a new one
      cart = new Cart({
        UsuarioAsociadoID: userId, // Match schema field name
        ListaItems: [{ ProductoID, Cantidad }] // Match schema field names
      });
    } else {
      const itemIndex = cart.ListaItems.findIndex(item => item.ProductoID.toString() === ProductoID); // Match schema field names
      if (itemIndex > -1) {
        // Item exists, update quantity
        cart.ListaItems[itemIndex].Cantidad += Cantidad; // Match schema field names
      } else {
        // Item does not exist, add new item
        cart.ListaItems.push({ ProductoID, Cantidad }); // Match schema field names
      }
    }

    await cart.save();
    // Populate the newly added/updated item's product info for the response
    // To ensure the client gets populated product details immediately
    await cart.populate('ListaItems.ProductoID'); // Correct population path

    res.status(200).json(cart); // Use 200 OK for updates/adds, 201 for initial creation of resource
  } catch (error) {
    console.error('Error al agregar al carrito:', error); // More specific logging
    res.status(500).json({ message: 'Error interno del servidor al agregar al carrito.' });
  }
};

// Eliminar producto del carrito
exports.removeFromCart = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { ProductoID } = req.body; // Match schema field name

  if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
  }
  if (!ProductoID) {
      return res.status(400).json({ message: 'ProductoID es requerido para eliminar.' });
  }

  try {
    const cart = await Cart.findOne({ UsuarioAsociadoID: userId }); // Match schema field name
    if (!cart) {
      // If no cart, nothing to remove, but this is a valid state
      return res.status(200).json({ message: 'Carrito no encontrado para este usuario, no hay nada que eliminar.' });
    }

    // Filter out the item to be removed
    const initialItemCount = cart.ListaItems.length;
    cart.ListaItems = cart.ListaItems.filter(item => item.ProductoID.toString() !== ProductoID); // Match schema field name

    if (cart.ListaItems.length === initialItemCount) {
        // If the item count hasn't changed, it means the product was not found in the cart
        return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    await cart.save();
    await cart.populate('ListaItems.ProductoID'); // Populate for response

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar del carrito.' });
  }
};
// Actualizar cantidad
exports.updateCartItem = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { ProductoID, Cantidad } = req.body; // Match schema field names

  if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
  }
  if (!ProductoID || Cantidad === undefined || Cantidad === null) {
      return res.status(400).json({ message: 'ProductoID y Cantidad son requeridos para actualizar.' });
  }
  if (Cantidad < 0) { // Allow 0 to remove item implicitly
      return res.status(400).json({ message: 'La cantidad no puede ser negativa.' });
  }

  try {
    const cart = await Cart.findOne({ UsuarioAsociadoID: userId }); // Match schema field name
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado para este usuario.' });
    }

    const item = cart.ListaItems.find(item => item.ProductoID.toString() === ProductoID); // Match schema field names
    if (!item) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito para actualizar.' });
    }

    if (Cantidad === 0) {
        // If quantity is 0, remove the item
        cart.ListaItems = cart.ListaItems.filter(i => i.ProductoID.toString() !== ProductoID);
    } else {
        item.Cantidad = Cantidad; // Update quantity
    }

    await cart.save();
    await cart.populate('ListaItems.ProductoID'); // Populate for response

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al actualizar cantidad en el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar cantidad.' });
  }
};

// Vaciar carrito
exports.emptyCart = async (req, res) => {
  const userId = getAuthenticatedUserId(req); // Get user ID from authenticated request or params

  if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
  }

  try {
    const cart = await Cart.findOne({ UsuarioAsociadoID: userId }); // Match schema field name
    if (!cart) {
      return res.status(200).json({ message: 'Carrito ya vacío o no encontrado para este usuario.' }); // 200 OK if nothing to empty
    }

    cart.ListaItems = []; // Empty the items array
    await cart.save();
    // No need to populate an empty array

    res.status(200).json({ message: 'Carrito vaciado exitosamente.', cart });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor al vaciar el carrito.' });
  }
};

/// Obtener carrito de un usuario (GET /api/cart/:userId or /api/cart/)
exports.getCartByUser = async (req, res) => {
  const userId = getAuthenticatedUserId(req); // Prefer req.user._id

  if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
  }

  try {
    // Find the cart by UsuarioAsociadoID and populate product details
    const cart = await Cart.findOne({ UsuarioAsociadoID: userId }) // Match schema field name
                           .populate('ListaItems.ProductoID'); // Correct population path

    if (!cart) {
        // If no cart found, create an empty one (Option B from previous discussion)
        // This makes sure the frontend always gets a cart object, even if empty.
        const newCart = await Cart.create({
            UsuarioAsociadoID: userId,
            ListaItems: []
        });
        // We don't need to populate newCart immediately as it's empty
        return res.status(200).json({ success: true, items: newCart.ListaItems });
    }

    res.status(200).json({ success: true, items: cart.ListaItems }); // Send the list of items
  } catch (error) {
    console.error('Error al obtener el carrito por usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el carrito.' });
  }
};