const { Product } = require('../models');

const ProductController = {
  create: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Forbidden' });

      const { name, description, price, images } = req.body;
      const product = await Product.create({
        farmerId: req.user.id,
        name,
        description,
        price,
        images
      });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  list: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Forbidden' });

      const products = await Product.findAll({ where: { farmerId: req.user.id } });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      // Farmers can access only their products
      if (req.user.role === 'farmer' && product.farmerId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Forbidden' });

      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.farmerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

      const { name, description, price, images } = req.body;
      await product.update({ name, description, price, images });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Forbidden' });

      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.farmerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

      await product.destroy();
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = ProductController;
