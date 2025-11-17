/*

require('dotenv').config();
const { connectDB } = require('../src/config/db');
const Product = require('../src/models/Product');

(async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany([
      { name: 'Laptop', description: '14\" 8GB RAM', price: 999.99, stock: 5 },
      { name: 'Mouse', description: 'Inalámbrico', price: 19.99, stock: 50 },
      { name: 'Teclado', description: 'Mecánico', price: 49.99, stock: 20 }
    ]);
    console.log('Seed done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

*/

//YA NO SIRVE, SE TUVO QUE PASAR DE JS A TS 