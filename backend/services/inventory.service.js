const { Product, ProductVariant, Color, Size, ProductImage, InventoryLog, sequelize } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
  // 1. Get Inventory Overview (Filter by status, search, low stock, out of stock)
  async getInventoryOverview(query = {}) {
    const { search, filter = 'ALL', threshold = 10 } = query;
    const lowStockLimit = parseInt(threshold) || 10;

    const whereProduct = {};
    if (search) {
      whereProduct.ProductName = { [Op.like]: `%${search}%` };
    }

    const products = await Product.findAll({
      where: whereProduct,
      include: [
        { model: ProductImage, as: 'Images', attributes: ['ImageUrl', 'IsPrimary'] },
        {
          model: ProductVariant,
          as: 'Variants',
          include: [
            { model: Size, as: 'Size', attributes: ['SizeId', 'SizeName'] },
            { model: Color, as: 'Color', attributes: ['ColorId', 'ColorName', 'HexCode'] }
          ]
        }
      ],
      order: [['ProductId', 'DESC']]
    });

    let totalProducts = products.length;
    let totalStockItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const processedProducts = products.map(prod => {
      const variants = prod.Variants || [];
      const prodTotalStock = variants.reduce((sum, v) => sum + (v.StockQuantity || 0), 0);
      totalStockItems += prodTotalStock;

      const processedVariants = variants.map(v => {
        const stock = v.StockQuantity || 0;
        const isOutOfStock = stock === 0;
        const isLowStock = stock > 0 && stock <= lowStockLimit;

        if (isOutOfStock) outOfStockCount++;
        if (isLowStock) lowStockCount++;

        return {
          VariantId: v.VariantId,
          ProductId: v.ProductId,
          ColorId: v.ColorId,
          ColorName: v.Color?.ColorName || 'N/A',
          HexCode: v.Color?.HexCode || null,
          SizeId: v.SizeId,
          SizeName: v.Size?.SizeName || 'N/A',
          SKU: v.SKU,
          StockQuantity: stock,
          AdditionalPrice: v.AdditionalPrice,
          IsActive: v.IsActive,
          IsOutOfStock: isOutOfStock,
          IsLowStock: isLowStock
        };
      });

      const prodIsOutOfStock = variants.length === 0 || processedVariants.every(v => v.IsOutOfStock);
      const prodHasLowStock = processedVariants.some(v => v.IsLowStock);

      return {
        ProductId: prod.ProductId,
        ProductName: prod.ProductName,
        Slug: prod.Slug,
        BasePrice: prod.BasePrice,
        SalePrice: prod.SalePrice,
        PrimaryImage: prod.Images?.find(i => i.IsPrimary)?.ImageUrl || prod.Images?.[0]?.ImageUrl || null,
        TotalStock: prodTotalStock,
        VariantCount: variants.length,
        IsOutOfStock: prodIsOutOfStock,
        HasLowStock: prodHasLowStock,
        Variants: processedVariants
      };
    });

    // Apply Filter (ALL | LOW_STOCK | OUT_OF_STOCK)
    let filteredList = processedProducts;
    if (filter === 'LOW_STOCK') {
      filteredList = processedProducts.filter(p => p.HasLowStock);
    } else if (filter === 'OUT_OF_STOCK') {
      filteredList = processedProducts.filter(p => p.IsOutOfStock);
    }

    return {
      stats: {
        totalProducts,
        totalStockItems,
        lowStockCount,
        outOfStockCount,
        lowStockLimit
      },
      products: filteredList
    };
  }

  // 2. Adjust Variant Stock Manually + Audit Log
  async adjustVariantStock(variantId, { newQuantity, note }) {
    const newQty = parseInt(newQuantity);
    if (isNaN(newQty) || newQty < 0) {
      throw new Error('Số lượng tồn kho mới phải là số nguyên lớn hơn hoặc bằng 0!');
    }

    const transaction = await sequelize.transaction();
    try {
      const variant = await ProductVariant.findByPk(variantId, { transaction });
      if (!variant) {
        throw new Error('Không tìm thấy biến thể sản phẩm!');
      }

      const oldQty = variant.StockQuantity || 0;
      const changeQty = newQty - oldQty;

      if (changeQty === 0) {
        await transaction.commit();
        return variant;
      }

      await variant.update({ StockQuantity: newQty }, { transaction });

      // Create Audit Log
      await InventoryLog.create({
        VariantId: variant.VariantId,
        ProductId: variant.ProductId,
        ChangeQuantity: changeQty,
        OldQuantity: oldQty,
        NewQuantity: newQty,
        Type: 'MANUAL_UPDATE',
        Note: note || 'Cập nhật số lượng tồn kho thủ công'
      }, { transaction });

      await transaction.commit();
      return await ProductVariant.findByPk(variantId, {
        include: [
          { model: Size, as: 'Size' },
          { model: Color, as: 'Color' }
        ]
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // 3. Deduct Stock Automatically on Order Creation/Success
  async deductStockForOrder(items, orderCode) {
    if (!items || items.length === 0) return;
    const transaction = await sequelize.transaction();

    try {
      for (const item of items) {
        if (!item.VariantId) continue;
        const variant = await ProductVariant.findByPk(item.VariantId, { transaction });
        if (variant) {
          const oldQty = variant.StockQuantity || 0;
          const deductQty = parseInt(item.Quantity) || 1;
          const newQty = Math.max(0, oldQty - deductQty);

          await variant.update({ StockQuantity: newQty }, { transaction });

          await InventoryLog.create({
            VariantId: variant.VariantId,
            ProductId: variant.ProductId,
            ChangeQuantity: -deductQty,
            OldQuantity: oldQty,
            NewQuantity: newQty,
            Type: 'ORDER_DEDUCT',
            Note: `Trừ tự động do đơn hàng #${orderCode}`
          }, { transaction });
        }
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error('Error deducting stock for order:', err);
    }
  }

  // 4. Restore Stock Automatically on Order Cancelled/Refunded
  async restoreStockForOrder(items, orderCode, reason = '') {
    if (!items || items.length === 0) return;
    const transaction = await sequelize.transaction();

    try {
      for (const item of items) {
        if (!item.VariantId) continue;
        const variant = await ProductVariant.findByPk(item.VariantId, { transaction });
        if (variant) {
          const oldQty = variant.StockQuantity || 0;
          const addQty = parseInt(item.Quantity) || 1;
          const newQty = oldQty + addQty;

          await variant.update({ StockQuantity: newQty }, { transaction });

          await InventoryLog.create({
            VariantId: variant.VariantId,
            ProductId: variant.ProductId,
            ChangeQuantity: addQty,
            OldQuantity: oldQty,
            NewQuantity: newQty,
            Type: 'ORDER_RESTORE',
            Note: `Cộng lại do hủy/trả đơn hàng #${orderCode}. ${reason}`
          }, { transaction });
        }
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error('Error restoring stock for order:', err);
    }
  }

  // 5. Get Audit Logs History
  async getInventoryLogs(query = {}) {
    const { page = 1, limit = 20, type } = query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type) {
      where.Type = type;
    }

    const { count, rows } = await InventoryLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['LogId', 'DESC']],
      include: [
        { model: Product, as: 'Product', attributes: ['ProductId', 'ProductName', 'Slug'] },
        {
          model: ProductVariant,
          as: 'Variant',
          attributes: ['VariantId', 'SKU'],
          include: [
            { model: Size, as: 'Size', attributes: ['SizeName'] },
            { model: Color, as: 'Color', attributes: ['ColorName'] }
          ]
        }
      ]
    });

    return {
      totalItems: count,
      logs: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  }
}

module.exports = new InventoryService();
