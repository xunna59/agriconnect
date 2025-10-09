const { Product } = require('../models');

const ProductController = {
 create: async (req, res) => {
  try {
    if (req.user.role !== "farmer")
      return res.status(403).json({ error: "Forbidden" });

    const { name, description, price } = req.body;

    const imageUrls = req.uploadedFiles || [];

    const product = await Product.create({
      farmerId: req.user.id,
      name,
      description,
      price,
      images: imageUrls, // store array of image URLs
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ error: err.message });
  }
},

list: async (req, res) => {
  try {
    // if (req.user.role !== "farmer")
    //   return res.status(403).json({ error: "Forbidden" });

    // Extract pagination query params
    const page = parseInt(req.query.page, 10) || 1; // default page 1
    const limit = parseInt(req.query.limit, 10) || 10; // default 10 per page
    const offset = (page - 1) * limit;

    // Fetch paginated products
    const { count, rows: products } = await Product.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: "success",
      message: "Products retrieved successfully.",
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: products,
    });
  } catch (err) {
    console.error("Product list error:", err);
    res.status(500).json({ error: err.message });
  }
},

listFarmerProducts: async (req, res) => {
  try {
    // Allow only farmer or admin
    if (!["farmer", "admin", "buyer"].includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (req.user.role === "farmer") {
      // Farmers can only view their own products
      whereClause = { farmerId: req.user.id };
    } else if (req.user.role === "admin") {
      // Admin can view products of a specific farmer via params
      const { farmerId } = req.params;
      if (!farmerId)
        return res
          .status(400)
          .json({ error: "Missing farmerId parameter for admin." });

      whereClause = { farmerId };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: "success",
      message: "Products retrieved successfully.",
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: products,
    });
  } catch (err) {
    console.error("Product list error:", err);
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
    if (req.user.role !== "farmer")
      return res.status(403).json({ error: "Forbidden" });

    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    if (product.farmerId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    const { name, description, price } = req.body;

    // Get newly uploaded images (if any)
    const newImages = req.uploadedFiles || [];

    // Merge existing images with new ones (optional)
    // If you want to **replace all images**, use only `newImages`
    const updatedImages = newImages.length
      ? [...(product.images || []), ...newImages]
      : product.images;

    await product.update({
      name,
      description,
      price,
      images: updatedImages,
    });

    res.json(product);
  } catch (err) {
    console.error("Product update error:", err);
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
