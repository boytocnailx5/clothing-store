const { Product, Category, ProductImage, ProductVariant, Size, Color, sequelize } = require('../models');
const { Op } = require('sequelize');

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Decompose combination characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '') // Remove non-alphas
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

class ProductService {
  async generateUniqueProductSlug(name, excludeId = null) {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (true) {
      const whereClause = { Slug: slug };
      if (excludeId) {
        whereClause.ProductId = { [Op.ne]: excludeId };
      }
      const existing = await Product.findOne({ where: whereClause });
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${count}`;
      count++;
    }
  }

  async getAllProducts(query = {}) {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      gender, 
      status, 
      search, 
      minPrice, 
      maxPrice 
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    // Category filter
    if (category) {
      // Find category (and check if it has subcategories)
      const cat = await Category.findOne({ 
        where: { 
          [Op.or]: [
            { CategoryId: isNaN(category) ? 0 : Number(category) },
            { Slug: category }
          ]
        },
        include: [{ model: Category, as: 'SubCategories' }]
      });

      if (cat) {
        const catIds = [cat.CategoryId];
        if (cat.SubCategories && cat.SubCategories.length > 0) {
          catIds.push(...cat.SubCategories.map(sub => sub.CategoryId));
        }
        where.CategoryId = { [Op.in]: catIds };
      } else {
        // Category not found, return empty results
        return {
          totalItems: 0,
          products: [],
          totalPages: 0,
          currentPage: Number(page)
        };
      }
    }

    // Gender filter
    if (gender) {
      where.Gender = gender.toUpperCase();
    }

    // Status filter - by default return only ACTIVE if not requested
    if (status) {
      where.Status = status.toUpperCase();
    } else {
      where.Status = 'ACTIVE';
    }

    // Search filter
    if (search) {
      where.ProductName = { [Op.like]: `%${search}%` };
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.BasePrice = {};
      if (minPrice !== undefined) {
        where.BasePrice[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        where.BasePrice[Op.lte] = parseFloat(maxPrice);
      }
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['CreatedAt', 'DESC']],
      distinct: true, // Crucial for correct count when including hasMany tables
      include: [
        { model: Category, as: 'Category', attributes: ['CategoryId', 'CategoryName', 'Slug'] },
        { model: ProductImage, as: 'Images', attributes: ['ImageId', 'ImageUrl', 'IsPrimary', 'SortOrder'] },
        { 
          model: ProductVariant, 
          as: 'Variants',
          attributes: ['VariantId', 'SKU', 'StockQuantity', 'AdditionalPrice', 'IsActive'],
          include: [
            { model: Size, as: 'Size', attributes: ['SizeId', 'SizeName'] },
            { model: Color, as: 'Color', attributes: ['ColorId', 'ColorName', 'HexCode'] }
          ]
        }
      ]
    });

    return {
      totalItems: count,
      products: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    };
  }

  async getProductById(productId) {
    return await Product.findByPk(productId, {
      include: [
        { model: Category, as: 'Category', attributes: ['CategoryId', 'CategoryName', 'Slug'] },
        { model: ProductImage, as: 'Images' },
        { 
          model: ProductVariant, 
          as: 'Variants',
          include: [
            { model: Size, as: 'Size' },
            { model: Color, as: 'Color' }
          ]
        }
      ]
    });
  }

  async createProduct(productData) {
    // Validate CategoryId
    const category = await Category.findByPk(productData.CategoryId);
    if (!category) {
      throw new Error('Category does not exist');
    }

    // Auto-slugify
    if (!productData.Slug && productData.ProductName) {
      productData.Slug = await this.generateUniqueProductSlug(productData.ProductName);
    }

    const transaction = await sequelize.transaction();
    try {
      const product = await Product.create(productData, { transaction });

      // Save images if provided
      if (productData.Images && productData.Images.length > 0) {
        const imagePayloads = productData.Images.map(img => ({
          ...img,
          ProductId: product.ProductId
        }));
        await ProductImage.bulkCreate(imagePayloads, { transaction });
      }

      // Save variants if provided
      if (productData.Variants && productData.Variants.length > 0) {
        // Basic SKU check
        const skus = productData.Variants.map(v => v.SKU);
        const dupSKU = skus.filter((sku, index) => skus.indexOf(sku) !== index);
        if (dupSKU.length > 0) {
          throw new Error(`Duplicate SKUs detected in request: ${dupSKU.join(', ')}`);
        }

        // Validate individual SKUs uniqueness in database
        const existingVariants = await ProductVariant.findOne({ 
          where: { SKU: { [Op.in]: skus } },
          transaction
        });
        if (existingVariants) {
          throw new Error(`SKU "${existingVariants.SKU}" is already in use`);
        }

        const variantPayloads = productData.Variants.map(variant => ({
          ...variant,
          ProductId: product.ProductId
        }));
        await ProductVariant.bulkCreate(variantPayloads, { transaction });
      }

      await transaction.commit();
      return await this.getProductById(product.ProductId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findByPk(productId);
    if (!product) return null;

    if (updateData.CategoryId) {
      const category = await Category.findByPk(updateData.CategoryId);
      if (!category) {
        throw new Error('Category does not exist');
      }
    }

    // Handle slug change
    if (updateData.ProductName && (!updateData.Slug || updateData.Slug === product.Slug)) {
      updateData.Slug = await this.generateUniqueProductSlug(updateData.ProductName, productId);
    } else if (updateData.Slug && updateData.Slug !== product.Slug) {
      const existing = await Product.findOne({ where: { Slug: updateData.Slug } });
      if (existing && existing.ProductId !== Number(productId)) {
        throw new Error('Slug already in use');
      }
    }

    const transaction = await sequelize.transaction();
    try {
      await product.update(updateData, { transaction });

      // If Images are provided in list, sync them
      if (updateData.Images !== undefined) {
        await ProductImage.destroy({
          where: { ProductId: productId },
          transaction
        });
        if (updateData.Images && updateData.Images.length > 0) {
          const imagePayloads = updateData.Images.map(img => ({
            ...img,
            ProductId: productId
          }));
          await ProductImage.bulkCreate(imagePayloads, { transaction });
        }
      }

      // If ProductVariants are provided, sync them
      if (updateData.Variants !== undefined) {
        // Validate SKU duplication within request
        if (updateData.Variants && updateData.Variants.length > 0) {
          const skus = updateData.Variants.map(v => v.SKU);
          const dupSKU = skus.filter((sku, index) => skus.indexOf(sku) !== index);
          if (dupSKU.length > 0) {
            throw new Error(`Duplicate SKUs detected in request: ${dupSKU.join(', ')}`);
          }

          // Check SKU uniqueness in other products
          const existingVariants = await ProductVariant.findOne({
            where: { 
              SKU: { [Op.in]: skus },
              ProductId: { [Op.ne]: productId }
            },
            transaction
          });
          if (existingVariants) {
            throw new Error(`SKU "${existingVariants.SKU}" is already in use by another product`);
          }
        }

        await ProductVariant.destroy({
          where: { ProductId: productId },
          transaction
        });

        if (updateData.Variants && updateData.Variants.length > 0) {
          const variantPayloads = updateData.Variants.map(variant => ({
            ...variant,
            ProductId: productId
          }));
          await ProductVariant.bulkCreate(variantPayloads, { transaction });
        }
      }

      await transaction.commit();
      return await this.getProductById(productId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteProduct(productId) {
    const product = await Product.findByPk(productId);
    if (!product) return null;
    
    // Deletes CASCADE on DB level, but we make it clean.
    await product.destroy();
    return true;
  }
}

module.exports = new ProductService();
