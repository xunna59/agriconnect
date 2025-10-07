const { WalletTransaction } = require('../models');

const WalletTransactionController = {
  listTransactions: async (req, res) => {
    try {
      let transactions;
      if (req.user.role === 'farmer' || req.user.role === 'buyer') {
        transactions = await WalletTransaction.findAll({ where: { userId: req.user.id } });
      } else if (req.user.role === 'admin') {
        transactions = await WalletTransaction.findAll();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = WalletTransactionController;
