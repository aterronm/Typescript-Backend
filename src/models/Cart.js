const mongoose = require('mongoose');
const { Schema } = mongoose;

//Product
//Un item es una instancia de producto, mas una cantidad, que minimo tiene que ser 0. el id lo genera mongoose 
const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

//Cart
//Un carrito de la compra tiene que tener un usuario id, e items. Tambien añadimos la fecha del carrito de la compra
const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: [] 
  }
}, { timestamps: true, versionKey: false });

//Exportamos el modelo
module.exports = mongoose.model('Cart', cartSchema);
