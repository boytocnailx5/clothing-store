const Category = require('../models/category.model');
const { Op } = require('sequelize');

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

class CategoryService {
  async generateUniqueCategorySlug(name, excludeId = null) {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (true) {
      const whereClause = { Slug: slug };
      if (excludeId) {
        whereClause.CategoryId = { [Op.ne]: excludeId };
      }
      const existing = await Category.findOne({ where: whereClause });
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${count}`;
      count++;
    }
  }

  async getAllCategories(query = {}) {
    if (query.tree === 'true') {
      return await Category.findAll({
        where: { ParentId: null },
        include: [{ model: Category, as: 'SubCategories' }]
      });
    }
    return await Category.findAll({
      include: [{ model: Category, as: 'ParentCategory' }]
    });
  }

  async getCategoryById(categoryId) {
    return await Category.findByPk(categoryId, {
      include: [
        { model: Category, as: 'SubCategories' },
        { model: Category, as: 'ParentCategory' }
      ]
    });
  }

  async createCategory(categoryData) {
    if (!categoryData.Slug && categoryData.CategoryName) {
      categoryData.Slug = await this.generateUniqueCategorySlug(categoryData.CategoryName);
    }
    if (categoryData.ParentId) {
      const parent = await Category.findByPk(categoryData.ParentId);
      if (!parent) throw new Error('Parent category does not exist');
    }
    return await Category.create(categoryData);
  }

  async updateCategory(categoryId, updateData) {
    const category = await Category.findByPk(categoryId);
    if (!category) return null;

    if (updateData.CategoryName && (!updateData.Slug || updateData.Slug === category.Slug)) {
      updateData.Slug = await this.generateUniqueCategorySlug(updateData.CategoryName, categoryId);
    } else if (updateData.Slug && updateData.Slug !== category.Slug) {
      const existing = await Category.findOne({ where: { Slug: updateData.Slug } });
      if (existing && existing.CategoryId !== Number(categoryId)) {
        throw new Error('Slug already in use');
      }
    }

    if (updateData.ParentId) {
      if (Number(updateData.ParentId) === Number(categoryId)) {
        throw new Error('Category cannot be its own parent');
      }
      const parent = await Category.findByPk(updateData.ParentId);
      if (!parent) throw new Error('Parent category does not exist');
    }

    return await category.update(updateData);
  }

  async deleteCategory(categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) return null;
    
    // Check if there are products in this category or subcategories referencing it.
    // OJT.sql is configured with FK_Products_Categories ON DELETE RESTRICT by default (no on delete cascade specified, so default is RESTRICT/NO ACTION).
    // So we should handle child records manually or let Sequelize report constraint failure.
    // Let's check subcategories
    const hasChildren = await Category.findOne({ where: { ParentId: categoryId } });
    if (hasChildren) {
      throw new Error('Cannot delete category with subcategories. Delete subcategories first.');
    }

    await category.destroy();
    return true;
  }
}

module.exports = new CategoryService();
