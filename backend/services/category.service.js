const Category = require('../models/category.model');

class CategoryService {
  async getAllCategories() {
    return await Category.findAll();
  }

  async getCategoryById(categoryId) {
    return await Category.findByPk(categoryId);
  }

  async createCategory(categoryData) {
    return await Category.create(categoryData);
  }

  async updateCategory(categoryId, updateData) {
    const category = await Category.findByPk(categoryId);
    if (!category) return null;
    return await category.update(updateData);
  }

  async deleteCategory(categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) return null;
    await category.destroy();
    return true;
  }
}

module.exports = new CategoryService();
