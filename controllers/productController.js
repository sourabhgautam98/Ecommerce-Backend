const Product = require('../models/Product');
const { uploadToFirebase, deleteFromFirebase } = require('../middleware/upload');

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, varieties } = req.body;

    // Validate required fields
    if (!name || !description || !price || !varieties) {
      return res.status(400).json({ 
        error: 'All fields (name, description, price, varieties) are required' 
      });
    }

    // Upload image to Firebase if exists
    let imageData = {};
    if (req.file) {
      imageData = await uploadToFirebase(req.file);
    }

    const productData = {
      name,
      description,
      price: Number(price),
      varieties,
      photoUrl: imageData.url || '',
      imagePath: imageData.filename || ''
    };

    const newProduct = await Product.create(productData);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message 
    });
  }
};

// ==================== GET ALL PRODUCTS ====================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      message: 'Products fetched successfully',
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
};

// ==================== GET PRODUCT BY ID ====================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product fetched successfully',
      product
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, varieties } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Upload new image if provided
    let imageData = {};
    if (req.file) {
      // Delete old image if exists
      if (currentProduct.imagePath) {
        await deleteFromFirebase(currentProduct.photoUrl);
      }
      imageData = await uploadToFirebase(req.file);
    }

    const updateData = {
      name: name || currentProduct.name,
      description: description || currentProduct.description,
      price: price ? Number(price) : currentProduct.price,
      varieties: varieties || currentProduct.varieties,
      photoUrl: imageData.url || currentProduct.photoUrl,
      imagePath: imageData.filename || currentProduct.imagePath
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated image from Firebase if exists
    if (product.imagePath) {
      await deleteFromFirebase(product.photoUrl);
    }

    res.status(200).json({ 
      message: 'Product deleted successfully',
      deletedProduct: {
        id: product._id,
        name: product.name
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
};