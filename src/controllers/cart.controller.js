const Cart = require('../models/cart');
const Ticket = require('../models/ticket');
const Product = require('../models/product.js');
const errorCodes = require('../utils/errorCodes');

exports.purchase = async (req, res, next) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            const error = new Error('Cart not found');
            error.code = 'CART_NOT_FOUND';
            throw error;
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
        next(error);
    }
};
