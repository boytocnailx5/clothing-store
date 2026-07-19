const orderService = require('../services/order.service');

class OrderController {
  async getAll(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newOrder = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await orderService.deleteOrder(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();
