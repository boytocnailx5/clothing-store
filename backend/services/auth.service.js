const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(userData) {
    // Check if user exists
    const existingUser = await User.findOne({ where: { Email: userData.Email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.Password, salt);

    // Create user
    const newUser = await User.create({
      ...userData,
      PasswordHash: hashedPassword,
      Role: userData.Role || 'CUSTOMER',
      Status: 'ACTIVE'
    });

    return newUser;
  }

  async login(email, password) {
    // Check if user exists
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check status
    if (user.Status === 'BLOCKED') {
      throw new Error('Your account has been blocked');
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.UserId, 
        email: user.Email, 
        role: user.Role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return {
      token,
      user: {
        userId: user.UserId,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
        status: user.Status
      }
    };
  }
}

module.exports = new AuthService();
