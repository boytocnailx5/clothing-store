const { Order, OrderItem, Coupon, sequelize } = require('../models');
const inventoryService = require('./inventory.service');

class OrderService {
  async getAllOrders() {
    return await Order.findAll({
      include: [{ model: OrderItem, as: 'Items' }],
      order: [['CreatedAt', 'DESC']]
    });
  }

  async getOrderById(orderId) {
    return await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'Items' }]
    });
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

      // Save OrderItems if provided
      if (orderData.Items && orderData.Items.length > 0) {
        const itemsPayload = orderData.Items.map(item => ({
          ...item,
          OrderId: order.OrderId,
          TotalPrice: parseFloat(item.Price) * parseInt(item.Quantity)
        }));
        await OrderItem.bulkCreate(itemsPayload, { transaction });
      }
      
      await transaction.commit();

      // Deduct Stock automatically for order items
      if (orderData.Items && orderData.Items.length > 0) {
        await inventoryService.deductStockForOrder(orderData.Items, order.OrderCode);
      }

      return await this.getOrderById(order.OrderId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateOrder(orderId, updateData) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'Items' }]
    });
    if (!order) return null;

    const oldStatus = order.OrderStatus;
    const oldPaymentStatus = order.PaymentStatus;

    await order.update(updateData);

    const newStatus = updateData.OrderStatus || oldStatus;
    const newPaymentStatus = updateData.PaymentStatus || oldPaymentStatus;

    // Check if Order was just Cancelled or Refunded
    const wasCancelled = oldStatus !== 'CANCELLED' && newStatus === 'CANCELLED';
    const wasRefunded = oldPaymentStatus !== 'REFUNDED' && newPaymentStatus === 'REFUNDED';

    if ((wasCancelled || wasRefunded) && order.Items && order.Items.length > 0) {
      await inventoryService.restoreStockForOrder(
        order.Items,
        order.OrderCode,
        updateData.CancelReason || 'Đơn hàng bị hủy/hoàn trả'
      );
    }

    return await this.getOrderById(orderId);
  }

  async deleteOrder(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) return null;
    await order.destroy();
    return true;
  }
}

module.exports = new OrderService();
