const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  varieties: String,
  photoUrl: String, // This will store the file path or URL
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
