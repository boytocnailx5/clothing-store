const { Coupon, CouponCategory, CouponProduct, Category, Product, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

class CouponService {
  async getAllCoupons(query) {
    const where = {};
    if (query.IsActive !== undefined) where.IsActive = query.IsActive === 'true';

    return await Coupon.findAll({
      where,
      include: [
        { model: Category, as: 'Categories', attributes: ['CategoryId', 'CategoryName'] },
        { model: Product, as: 'Products', attributes: ['ProductId', 'ProductName'] }
      ]
    });
  }

  async getCouponById(id) {
    return await Coupon.findByPk(id, {
      include: [
        { model: Category, as: 'Categories', attributes: ['CategoryId', 'CategoryName'] },
        { model: Product, as: 'Products', attributes: ['ProductId', 'ProductName'] }
      ]
    });
  }

  async getCouponByCode(code) {
    return await Coupon.findOne({
      where: { Code: code, IsActive: true },
      include: [
        { model: Category, as: 'Categories', attributes: ['CategoryId'] },
        { model: Product, as: 'Products', attributes: ['ProductId'] }
      ]
    });
  }

  async createCoupon(data) {
    const transaction = await sequelize.transaction();
    try {
      // Tách CategoryIds và ProductIds ra khỏi data trước khi tạo Coupon
      // để tránh Sequelize ValidationError khi gặp field không có trong model
      const { CategoryIds, ProductIds, ...couponData } = data;

      const coupon = await Coupon.create(couponData, { transaction });

      if (couponData.ApplyTo === 'CATEGORY' && CategoryIds && CategoryIds.length > 0) {
        const categories = CategoryIds.map(id => ({ CouponId: coupon.CouponId, CategoryId: id }));
        await CouponCategory.bulkCreate(categories, { transaction });
      } else if (couponData.ApplyTo === 'PRODUCT' && ProductIds && ProductIds.length > 0) {
        const products = ProductIds.map(id => ({ CouponId: coupon.CouponId, ProductId: id }));
        await CouponProduct.bulkCreate(products, { transaction });
      }

      await transaction.commit();
      return await this.getCouponById(coupon.CouponId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateCoupon(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const coupon = await Coupon.findByPk(id);
      if (!coupon) throw new Error('Coupon not found');

      // Tách CategoryIds và ProductIds ra khỏi data trước khi update
      const { CategoryIds, ProductIds, ...couponData } = data;

      await coupon.update(couponData, { transaction });

      if (couponData.ApplyTo === 'CATEGORY') {
        await CouponCategory.destroy({ where: { CouponId: id }, transaction });
        if (CategoryIds && CategoryIds.length > 0) {
          const categories = CategoryIds.map(catId => ({ CouponId: id, CategoryId: catId }));
          await CouponCategory.bulkCreate(categories, { transaction });
        }
      } else if (couponData.ApplyTo === 'PRODUCT') {
        await CouponProduct.destroy({ where: { CouponId: id }, transaction });
        if (ProductIds && ProductIds.length > 0) {
          const products = ProductIds.map(prodId => ({ CouponId: id, ProductId: prodId }));
          await CouponProduct.bulkCreate(products, { transaction });
        }
      } else if (couponData.ApplyTo === 'ALL') {
        await CouponCategory.destroy({ where: { CouponId: id }, transaction });
        await CouponProduct.destroy({ where: { CouponId: id }, transaction });
      }

      await transaction.commit();
      return await this.getCouponById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findByPk(id);
    if (!coupon) return false;
    await coupon.destroy();
    return true;
  }

  async toggleActive(id) {
    const coupon = await Coupon.findByPk(id);
    if (!coupon) return null;
    await coupon.update({ IsActive: !coupon.IsActive });
    return coupon;
  }

  async validateCoupon(code, userId, orderTotal, items = []) {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) {
      throw new Error('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.');
    }

    const now = new Date();
    if (now < new Date(coupon.StartDate)) {
      throw new Error('Mã giảm giá chưa đến thời gian bắt đầu.');
    }
    if (coupon.EndDate && now > new Date(coupon.EndDate)) {
      throw new Error('Mã giảm giá đã hết hạn.');
    }

    if (coupon.UsageLimit !== null && coupon.UsedCount >= coupon.UsageLimit) {
      throw new Error('Mã giảm giá đã hết lượt sử dụng.');
    }

    if (coupon.UsageLimitPerUser !== null && userId) {
      const userUsageCount = await Order.count({
        where: { UserId: userId, CouponId: coupon.CouponId }
      });
      if (userUsageCount >= coupon.UsageLimitPerUser) {
        throw new Error('Bạn đã hết lượt sử dụng mã này.');
      }
    }

    if (orderTotal < coupon.MinOrderValue) {
      throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu (${coupon.MinOrderValue}).`);
    }

    // Check Applicable Categories / Products
    let eligibleTotal = orderTotal; // default
    if (coupon.ApplyTo === 'CATEGORY') {
      const validCategoryIds = coupon.Categories.map(c => c.CategoryId);
      const eligibleItems = items.filter(item => validCategoryIds.includes(Number(item.CategoryId)));
      if (eligibleItems.length === 0) {
        throw new Error('Mã giảm giá không áp dụng cho danh mục sản phẩm trong giỏ hàng.');
      }
      eligibleTotal = eligibleItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
    } else if (coupon.ApplyTo === 'PRODUCT') {
      const validProductIds = coupon.Products.map(p => p.ProductId);
      const eligibleItems = items.filter(item => validProductIds.includes(Number(item.ProductId)));
      if (eligibleItems.length === 0) {
        throw new Error('Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng.');
      }
      eligibleTotal = eligibleItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.DiscountType === 'FIXED_AMOUNT') {
      discountAmount = Number(coupon.DiscountValue);
    } else if (coupon.DiscountType === 'PERCENTAGE') {
      discountAmount = (eligibleTotal * Number(coupon.DiscountValue)) / 100;
      if (coupon.MaxDiscountAmount !== null && discountAmount > coupon.MaxDiscountAmount) {
        discountAmount = Number(coupon.MaxDiscountAmount);
      }
    }

    return {
      isValid: true,
      coupon,
      discountAmount
    };
  }
}

module.exports = new CouponService();
