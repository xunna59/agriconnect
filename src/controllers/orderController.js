const PaystackService = require('../services/paystack');
const { Order, Product, WalletTransaction, User } = require('../models');


const OrderController = {
 

   placeOrder: async (req, res) => {
    try {
      if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden - UnAuthorised Access' });

      const { productId, quantity } = req.body;
      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const totalPrice = product.price * quantity;

      const order = await Order.create({
        buyerId: req.user.id,
        productId,
        quantity,
        totalAmount: totalPrice,
        status: 'pending',
      });

      const paymentInit = await PaystackService.initializePayment(
        req.user.email,
        totalPrice,
        {
          orderId: order.id,
          buyerId: req.user.id,
          farmerId: product.farmerId,
        }
      );

      res.json({
        status: 'success',
        message: 'Payment initialized, proceed to pay using Paystack.',
        paymentUrl: paymentInit.data.authorization_url,
        reference: paymentInit.data.reference,
        order,
      });
    } catch (err) {
      console.error('Error placing order:', err);
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
  },

  verifyPayment: async (req, res) => {
    try {
      const { reference } = req.params;

      const response = await PaystackService.verifyPayment(reference);

      if (response.data.status !== 'success') {
        return res.status(400).json({ error: 'Payment not successful' });
      }

      const metadata = response.data.metadata;
      const { orderId, buyerId } = metadata;

      const order = await Order.findByPk(orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });

    

        const existingTransaction = await WalletTransaction.findOne({ where: { reference } });
    if (existingTransaction) {
      return res.status(200).json({
        status: 'success',
        message: 'Payment already verified earlier',
        data: order,
      });
    }


    if (order.status === 'pending') {
  order.status = 'in_escrow';
  await order.save();
}

      // 💼 Log escrow transaction
      await WalletTransaction.create({
        userId: buyerId,
        amount: order.totalAmount,
        type: 'escrow_hold',
        reference,
        note: 'Funds held in escrow',
      });

      res.json({
        status: 'success',
        message: 'Payment verified and funds held in escrow',
        data: order,
      });
    } catch (err) {
      console.error('Payment verification failed:', err);
      res.status(500).json({ error: err.message });
    }
  },

  handleWebhook: async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // ✅ Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("❌ Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      const metadata = data.metadata || {};
      const { orderId, buyerId, farmerId } = metadata;

      // ✅ Check if wallet transaction already exists
      const existingTxn = await WalletTransaction.findOne({ where: { reference } });
      if (existingTxn) {
        console.log("⚠️ Duplicate webhook ignored — transaction already processed:", reference);
        return res.sendStatus(200);
      }

      // ✅ Confirm payment via Paystack API (optional but safer)
      const verifyResponse = await PaystackService.verifyPayment(reference);
      if (!verifyResponse || verifyResponse.status !== "success") {
        console.warn("❌ Payment not verified for:", reference);
        return res.status(400).send("Payment not verified");
      }

      // ✅ Retrieve the order
      const order = await Order.findByPk(orderId);
      if (!order) {
        console.warn("❌ Order not found:", orderId);
        return res.status(404).send("Order not found");
      }

      // ✅ Update order status only if it's still pending/unpaid
      if (order.status === "pending" ) {
        order.status = "in_escrow";
        await order.save();
        console.log("✅ Order status updated to 'paid' for:", order.id);
      } else {
        console.log(`⚠️ Order already ${order.status}, skipping status update.`);
      }

      // ✅ Record wallet transaction only once
      await WalletTransaction.create({
        userId: buyerId,
        amount: order.totalAmount,
        type: "payment",
        reference,
        note: "Payment confirmed by Paystack",
      });

      console.log("✅ Payment verified for Order:", order.id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
},

};

module.exports = OrderController;
