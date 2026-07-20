const { User, Order, Address } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class UserService {
  async getAllUsers(searchKey = '') {
    const whereCondition = {};
    if (searchKey && searchKey.trim() !== '') {
      const term = `%${searchKey.trim()}%`;
      whereCondition[Op.or] = [
        { FullName: { [Op.like]: term } },
        { Email: { [Op.like]: term } },
        { Phone: { [Op.like]: term } }
      ];
    }

    const users = await User.findAll({
      where: whereCondition,
      attributes: { exclude: ['PasswordHash'] },
      include: [
        {
          model: Order,
          as: 'Orders',
          attributes: ['OrderId', 'OrderCode', 'TotalAmount', 'OrderStatus', 'PaymentStatus', 'CreatedAt']
        },
        {
          model: Address,
          as: 'Addresses'
        }
      ],
      order: [['CreatedAt', 'DESC']]
    });

    // Tính toán metrics tổng số đơn hàng & tổng tiền mua cho từng user
    return users.map(user => {
      const uJson = user.toJSON();
      const orders = uJson.Orders || [];
      const totalOrders = orders.length;
      const totalSpent = orders
        .filter(o => o.OrderStatus !== 'CANCELLED')
        .reduce((sum, o) => sum + Number(o.TotalAmount || 0), 0);

      return {
        ...uJson,
        totalOrders,
        totalSpent
      };
    });
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['PasswordHash'] },
      include: [
        {
          model: Address,
          as: 'Addresses'
        },
        {
          model: Order,
          as: 'Orders'
        }
      ]
    });

    if (!user) return null;

    const uJson = user.toJSON();
    const orders = uJson.Orders || [];
    // Sắp xếp đơn hàng mới nhất lên đầu
    orders.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    uJson.Orders = orders;

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(o => o.OrderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.TotalAmount || 0), 0);

    return {
      ...uJson,
      totalOrders,
      totalSpent
    };
  }

  async createUser(userData) {
    if (userData.Password) {
      const salt = await bcrypt.genSalt(10);
      userData.PasswordHash = await bcrypt.hash(userData.Password, salt);
    }
    return await User.create(userData);
  }

  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    if (updateData.Password) {
      const salt = await bcrypt.genSalt(10);
      updateData.PasswordHash = await bcrypt.hash(updateData.Password, salt);
      delete updateData.Password;
    }

    return await user.update(updateData);
  }

  async toggleUserStatus(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const newStatus = user.Status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.update({ Status: newStatus });
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    await user.destroy();
    return true;
  }
}

module.exports = new UserService();
