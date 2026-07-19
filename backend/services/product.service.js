const Product = require('../models/product.model');

class ProductService {
  async getAllProducts() {
    return await Product.findAll();
  }

  async getProductById(productId) {
    return await Product.findByPk(productId);
  }

  async createProduct(productData) {
    return await Product.create(productData);
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findByPk(productId);
    if (!product) return null;
    return await product.update(updateData);
  }

  async deleteProduct(productId) {
    const product = await Product.findByPk(productId);
    if (!product) return null;
    await product.destroy();
    return true;
  }
}

module.exports = new ProductService();
