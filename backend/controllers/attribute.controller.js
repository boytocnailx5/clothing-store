const attributeService = require('../services/attribute.service');

class AttributeController {
  // COLORS
  async getColors(req, res) {
    try {
      const colors = await attributeService.getAllColors();
      res.json(colors);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async createColor(req, res) {
    try {
      const color = await attributeService.createColor(req.body);
      res.status(201).json(color);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async updateColor(req, res) {
    try {
      const color = await attributeService.updateColor(req.params.id, req.body);
      res.json(color);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async deleteColor(req, res) {
    try {
      await attributeService.deleteColor(req.params.id);
      res.json({ message: 'Xóa màu thành công' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // SIZES
  async getSizes(req, res) {
    try {
      const sizes = await attributeService.getAllSizes();
      res.json(sizes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async createSize(req, res) {
    try {
      const size = await attributeService.createSize(req.body);
      res.status(201).json(size);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async updateSize(req, res) {
    try {
      const size = await attributeService.updateSize(req.params.id, req.body);
      res.json(size);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async deleteSize(req, res) {
    try {
      await attributeService.deleteSize(req.params.id);
      res.json({ message: 'Xóa kích thước thành công' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = new AttributeController();
