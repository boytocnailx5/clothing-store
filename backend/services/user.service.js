const User = require('../models/user.model');

class UserService {
  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ['PasswordHash'] } // Không trả về password
    });
  }

  async getUserById(userId) {
    return await User.findByPk(userId, {
      attributes: { exclude: ['PasswordHash'] }
    });
  }

  async createUser(userData) {
    // Trong thực tế cần hash password bằng bcrypt trước khi lưu
    return await User.create(userData);
  }

  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    return await user.update(updateData);
  }

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    await user.destroy();
    return true;
  }
}

module.exports = new UserService();
