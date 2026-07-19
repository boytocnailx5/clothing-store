const productService = require('../services/product.service');

class ProductController {
  async getAll(req, res) {
    try {
      const result = await productService.getAllProducts(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { CategoryId, ProductName, BasePrice } = req.body;
      if (!CategoryId) {
        return res.status(400).json({ success: false, message: 'CategoryId is required' });
      }
      if (!ProductName) {
        return res.status(400).json({ success: false, message: 'ProductName is required' });
      }
      if (BasePrice === undefined || BasePrice < 0) {
        return res.status(400).json({ success: false, message: 'BasePrice must be greater than or equal to 0' });
      }

      const newProduct = await productService.createProduct(req.body);
      res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { BasePrice, SalePrice } = req.body;
      if (BasePrice !== undefined && BasePrice < 0) {
        return res.status(400).json({ success: false, message: 'BasePrice must be greater than or equal to 0' });
      }
      if (SalePrice !== undefined && SalePrice !== null && SalePrice < 0) {
        return res.status(400).json({ success: false, message: 'SalePrice must be greater than or equal to 0' });
      }

      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await productService.deleteProduct(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController();
