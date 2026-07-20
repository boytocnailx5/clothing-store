const couponService = require('../services/coupon.service');

class CouponController {
  async getAll(req, res) {
    try {
      const coupons = await couponService.getAllCoupons(req.query);
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const coupon = await couponService.getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      console.log('CREATE COUPON PAYLOAD:', JSON.stringify(req.body, null, 2));
      const newCoupon = await couponService.createCoupon(req.body);
      res.status(201).json({ success: true, data: newCoupon });
    } catch (error) {
      console.error('CREATE COUPON ERROR:', error.message);
      if (error.errors) error.errors.forEach(e => console.error(' -', e.message));
      res.status(400).json({ success: false, message: error.errors ? error.errors.map(e => e.message).join(', ') : error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedCoupon = await couponService.updateCoupon(req.params.id, req.body);
      res.status(200).json({ success: true, data: updatedCoupon });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await couponService.deleteCoupon(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleActive(req, res) {
    try {
      const coupon = await couponService.toggleActive(req.params.id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async validate(req, res) {
    try {
      // req.body should contain: code, orderTotal, items, and possibly userId (if authenticated)
      const { code, orderTotal, items } = req.body;
      const userId = req.user ? req.user.UserId : null; // Assume auth middleware

      if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
      }

      const result = await couponService.validateCoupon(code, userId, orderTotal, items || []);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CouponController();
