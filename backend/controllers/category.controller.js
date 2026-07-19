const categoryService = require('../services/category.service');

class CategoryController {
  async getAll(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newCategory = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CategoryController();
