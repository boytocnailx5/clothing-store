const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

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

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    await user.destroy();
    return true;
  }
}

module.exports = new UserService();

