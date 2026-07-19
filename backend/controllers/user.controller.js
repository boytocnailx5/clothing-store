const userService = require('../services/user.service');

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newUser = await userService.createUser(req.body);
      // Remove password hash from response
      const userData = newUser.toJSON();
      delete userData.PasswordHash;
      res.status(201).json({ success: true, data: userData });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const userData = updatedUser.toJSON();
      delete userData.PasswordHash;
      res.status(200).json({ success: true, data: userData });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
