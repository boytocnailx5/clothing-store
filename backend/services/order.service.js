const Order = require('../models/order.model');
// Có thể require User, OrderItem nếu cần join

class OrderService {
  async getAllOrders() {
    return await Order.findAll();
  }

  async getOrderById(orderId) {
    return await Order.findByPk(orderId);
  }

  async createOrder(orderData) {
    return await Order.create(orderData);
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
