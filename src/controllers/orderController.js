const { Order, Product, WalletTransaction, User } = require('../models');

const OrderController = {
  placeOrder: async (req, res) => {
    try {
      if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });

      const { productId, quantity } = req.body;
      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const totalPrice = product.price * quantity;

      const order = await Order.create({
        buyerId: req.user.id,
        productId,
        quantity,
        totalPrice,
        status: 'pending'
      });

      await WalletTransaction.create({
        userId: req.user.id,
        amount: totalPrice,
        type: 'escrow_hold',
        reference: `Order#${order.id}`,
        note: 'Funds held in escrow'
      });

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  confirmDelivery: async (req, res) => {
    try {
      if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });

      const order = await Order.findByPk(req.params.id, { include: Product });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      await WalletTransaction.create({
        userId: order.Product.farmerId,
        amount: order.totalPrice,
        type: 'escrow_release',
        reference: `Order#${order.id}`,
        note: 'Funds released from escrow'
      });

      const farmer = await User.findByPk(order.Product.farmerId);
      farmer.walletBalance += order.totalPrice;
      await farmer.save();

      order.status = 'completed';
      await order.save();

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  listOrders: async (req, res) => {
    try {
      let orders;
      if (req.user.role === 'buyer') {
        orders = await Order.findAll({ where: { buyerId: req.user.id } });
      } else if (req.user.role === 'farmer') {
        const products = await Product.findAll({ where: { farmerId: req.user.id } });
        const productIds = products.map(p => p.id);
        orders = await Order.findAll({ where: { productId: productIds } });
      } else if (req.user.role === 'admin') {
        orders = await Order.findAll();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = OrderController;
