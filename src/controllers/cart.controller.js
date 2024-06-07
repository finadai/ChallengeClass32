const Cart = require('../models/cart');
const Ticket = require('../models/ticket');
const Product = require('../models/product');

exports.purchase = async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const unavailableProducts = [];

        let totalAmount = 0;
        for (const item of cart.products) {
            const product = item.product;
            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await product.save();
                totalAmount += product.price * item.quantity;
            } else {
                unavailableProducts.push(product._id);
            }
        }

        const ticket = new Ticket({
            amount: totalAmount,
            purchaser: req.session.user.email
        });

        await ticket.save();

        cart.products = cart.products.filter(item => unavailableProducts.includes(item.product._id));
        await cart.save();

        res.status(200).json({ ticket, unavailableProducts });
    } catch (error) {
        console.error('Error en la compra:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
