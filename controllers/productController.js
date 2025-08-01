const Product = require("../models/Product");
const Order = require("../models/Order");
const { deleteFromFirebase } = require("../middleware/upload");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, varieties, photoUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !varieties || !photoUrl) {
      return res.status(400).json({
        error:
          "All fields (name, description, price, varieties, photoUrl) are required",
      });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      varieties,
      photoUrl,
    };

    const newProduct = await Product.create(productData);

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      error: "Failed to create product",
      details: error.message,
    });
  }
};

//GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
      details: error.message,
    });
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      error: "Failed to fetch product",
      details: error.message,
    });
  }
};

//UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, varieties, photoUrl } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updateData = {
      name: name || currentProduct.name,
      description: description || currentProduct.description,
      price: price ? Number(price) : currentProduct.price,
      varieties: varieties || currentProduct.varieties,
      photoUrl,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      error: "Failed to update product",
      details: error.message,
    });
  }
};

//DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.imagePath) {
      await deleteFromFirebase(product.photoUrl);
    }

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: {
        id: product._id,
        name: product.name,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      error: "Failed to delete product",
      details: error.message,
    });
  }
};

// GET ORDER FOR A PRODUCT
exports.productPlaced = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userDetails = req.user;
    const userId = userDetails.id;
    console.log({ userDetails });
    console.log({ userId });
    console.log({ productId });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const order = await Order.create({
      userId,
      productId,
      quantity: quantity || 1
    });

    res.status(200).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({
      error: "Failed to place order",
      details: error.message,
    });
  }
};
//user see product order
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; 
    
 
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const product = await Product.findById(order.productId);
        return {
          _id: order._id,
          productId: order.productId,
          quantity: order.quantity,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          product: product ? {
            name: product.name,
            price: product.price,
            photoUrl: product.photoUrl
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithProducts,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user orders"
    });
  }
};


// admin to see all orders
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Unauthorized access"
      });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('productId', 'name price photoUrl');

    res.status(200).json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get orders"
    });
  }
};