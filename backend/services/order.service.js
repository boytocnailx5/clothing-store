const { Order, Coupon, sequelize } = require('../models');

class OrderService {
  async getAllOrders() {
    return await Order.findAll();
  }

  async getOrderById(orderId) {
    return await Order.findByPk(orderId);
  }

  async createOrder(orderData) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.create(orderData, { transaction });
      
      if (orderData.CouponId) {
        const coupon = await Coupon.findByPk(orderData.CouponId, { transaction });
        if (coupon) {
          await coupon.increment('UsedCount', { by: 1, transaction });
        }
      }
      
      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateOrder(orderId, updateData) {
    const order = await Order.findByPk(orderId);
    if (!order) return null;
    return await order.update(updateData);
  }

  async deleteOrder(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) return null;
    await order.destroy();
    return true;
  }
}

module.exports = new OrderService();
