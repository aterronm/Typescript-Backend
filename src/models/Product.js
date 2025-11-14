const mongoose = require('mongoose');

//Schema del producto
//Un producto tiene nombre, descripcion, precio, stock, y la fecha de creación, 
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: [0.01, 'Price must be > 0'] },
  stock: { type: Number, required: true, min: [0, 'Stock must be >= 0'] },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Product', productSchema);
