const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const { fullName, email, phone, password } = req.body;
      const newUser = await authService.register({
        FullName: fullName,
        Email: email,
        Phone: phone,
        Password: password
      });
      // Remove password hash from response
      const userData = newUser.toJSON();
      delete userData.PasswordHash;
      
      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        data: userData 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const result = await authService.login(email, password);
      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        data: result 
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  // Phương thức dùng để test token
  async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'This is a protected route',
        user: req.user
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
