const { Color, Size } = require('../models');

class AttributeService {
  // Ensure default Sizes & Colors exist in Database
  async seedDefaultsIfEmpty() {
    try {
      const sizeCount = await Size.count();
      if (sizeCount === 0) {
        const defaultSizes = [
          { SizeName: 'S', SortOrder: 1 },
          { SizeName: 'M', SortOrder: 2 },
          { SizeName: 'L', SortOrder: 3 },
          { SizeName: 'XL', SortOrder: 4 },
          { SizeName: '2XL', SortOrder: 5 },
          { SizeName: '3XL', SortOrder: 6 },
          { SizeName: 'Freesize', SortOrder: 7 }
        ];
        await Size.bulkCreate(defaultSizes);
        console.log('✔ Default sizes seeded');
      }

      const colorCount = await Color.count();
      if (colorCount === 0) {
        const defaultColors = [
          { ColorName: 'Đen', HexCode: '#000000' },
          { ColorName: 'Trắng', HexCode: '#FFFFFF' },
          { ColorName: 'Xanh navy', HexCode: '#000080' },
          { ColorName: 'Xám', HexCode: '#808080' },
          { ColorName: 'Be', HexCode: '#F5F5DC' },
          { ColorName: 'Nâu', HexCode: '#8B4513' },
          { ColorName: 'Đỏ', HexCode: '#FF0000' },
          { ColorName: 'Vàng', HexCode: '#FFFF00' },
          { ColorName: 'Xanh dương', HexCode: '#0000FF' },
          { ColorName: 'Hồng', HexCode: '#FFC0CB' }
        ];
        await Color.bulkCreate(defaultColors);
        console.log('✔ Default colors seeded');
      }
    } catch (err) {
      console.warn('Seed defaults notice:', err.message);
    }
  }

  // --- COLORS ---
  async getAllColors() {
    await this.seedDefaultsIfEmpty();
    return await Color.findAll({ order: [['ColorName', 'ASC']] });
  }

  async createColor(data) {
    const existing = await Color.findOne({ where: { ColorName: data.ColorName } });
    if (existing) {
      throw new Error(`Màu "${data.ColorName}" đã tồn tại!`);
    }
    return await Color.create(data);
  }

  async updateColor(id, data) {
    const color = await Color.findByPk(id);
    if (!color) throw new Error('Không tìm thấy màu sắc');
    return await color.update(data);
  }

  async deleteColor(id) {
    const color = await Color.findByPk(id);
    if (!color) throw new Error('Không tìm thấy màu sắc');
    await color.destroy();
    return true;
  }

  // --- SIZES ---
  async getAllSizes() {
    await this.seedDefaultsIfEmpty();
    return await Size.findAll({ order: [['SortOrder', 'ASC'], ['SizeName', 'ASC']] });
  }

  async createSize(data) {
    const existing = await Size.findOne({ where: { SizeName: data.SizeName } });
    if (existing) {
      throw new Error(`Kích thước "${data.SizeName}" đã tồn tại!`);
    }
    return await Size.create(data);
  }

  async updateSize(id, data) {
    const size = await Size.findByPk(id);
    if (!size) throw new Error('Không tìm thấy kích thước');
    return await size.update(data);
  }

  async deleteSize(id) {
    const size = await Size.findByPk(id);
    if (!size) throw new Error('Không tìm thấy kích thước');
    await size.destroy();
    return true;
  }
}

module.exports = new AttributeService();
