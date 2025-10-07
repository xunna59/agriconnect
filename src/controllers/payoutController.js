const { Payout, User, WalletTransaction } = require('../models');

const PayoutController = {
  requestPayout: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Forbidden' });

      const { amount } = req.body;
      if (amount > req.user.walletBalance) return res.status(400).json({ error: 'Insufficient wallet balance' });

      const payout = await Payout.create({
        userId: req.user.id,
        amount,
        status: 'pending'
      });

      res.json({ message: 'Payout requested', payout });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  approvePayout: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

      const payout = await Payout.findByPk(req.params.id);
      if (!payout) return res.status(404).json({ error: 'Payout not found' });
      if (payout.status !== 'pending') return res.status(400).json({ error: 'Payout already processed' });

      // Deduct from farmer wallet
      const farmer = await User.findByPk(payout.userId);
      if (farmer.walletBalance < payout.amount) return res.status(400).json({ error: 'Farmer has insufficient balance' });

      farmer.walletBalance -= payout.amount;
      await farmer.save();

      // Update payout status
      payout.status = 'approved';
      await payout.save();

      // Record wallet transaction
      await WalletTransaction.create({
        userId: farmer.id,
        amount: payout.amount,
        type: 'payout',
        reference: `Payout#${payout.id}`,
        note: 'Payout approved and sent to farmer account'
      });

      res.json({ message: 'Payout approved', payout });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  listPayouts: async (req, res) => {
    try {
      let payouts;
      if (req.user.role === 'farmer') {
        payouts = await Payout.findAll({ where: { userId: req.user.id } });
      } else if (req.user.role === 'admin') {
        payouts = await Payout.findAll();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(payouts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = PayoutController;
