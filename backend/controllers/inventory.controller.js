const inventoryService = require('../services/inventory.service');

class InventoryController {
  async getOverview(req, res) {
    try {
      const data = await inventoryService.getInventoryOverview(req.query);
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async adjustStock(req, res) {
    try {
      const { variantId } = req.params;
      const updated = await inventoryService.adjustVariantStock(variantId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getLogs(req, res) {
    try {
      const data = await inventoryService.getInventoryLogs(req.query);
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new InventoryController();
