require('dotenv').config();
const { sequelize, Product, ProductVariant, Color, Size } = require('./models');
const attributeService = require('./services/attribute.service');

async function seedProductVariants() {
  console.log('=== SEEDING VARIANTS (COLOR x SIZE) FOR ALL PRODUCTS ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    await attributeService.seedDefaultsIfEmpty();

    const colors = await Color.findAll();
    const sizes = await Size.findAll();
    const products = await Product.findAll({
      include: [{ association: 'Images' }]
    });

    console.log(`Found ${products.length} products, ${colors.length} colors, ${sizes.length} sizes.`);

    let totalVariantsCreated = 0;

    for (const prod of products) {
      // Find colors used in ProductImages or pick first 2-3 colors
      let prodColorNames = prod.Images
        ? [...new Set(prod.Images.map(img => img.ColorName).filter(Boolean))]
        : [];
      
      if (prodColorNames.length === 0) {
        prodColorNames = ['Đen', 'Trắng'];
      }

      // Map color names to Color objects
      const matchedColors = colors.filter(c => prodColorNames.includes(c.ColorName));
      const targetColors = matchedColors.length > 0 ? matchedColors : colors.slice(0, 2);

      // Pick sizes S, M, L, XL
      const targetSizes = sizes.filter(s => ['S', 'M', 'L', 'XL'].includes(s.SizeName));

      // Destroy existing variants
      await ProductVariant.destroy({ where: { ProductId: prod.ProductId } });

      const variantPayloads = [];
      const cleanProdName = prod.ProductName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 6);

      targetColors.forEach((color, cIdx) => {
        const cleanColor = color.ColorName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'D')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
          .slice(0, 3);

        targetSizes.forEach((size, sIdx) => {
          const sku = `${cleanProdName}-${cleanColor}-${size.SizeName}-${prod.ProductId}`;
          variantPayloads.push({
            ProductId: prod.ProductId,
            ColorId: color.ColorId,
            SizeId: size.SizeId,
            SKU: sku,
            StockQuantity: Math.floor(Math.random() * 80) + 20, // 20-100 stock
            AdditionalPrice: 0,
            IsActive: true
          });
        });
      });

      if (variantPayloads.length > 0) {
        await ProductVariant.bulkCreate(variantPayloads);
        totalVariantsCreated += variantPayloads.length;
        console.log(`+ [Product #${prod.ProductId}] Created ${variantPayloads.length} variants (${targetColors.map(c=>c.ColorName).join(', ')} × ${targetSizes.map(s=>s.SizeName).join(', ')})`);
      }
    }

    console.log(`\n🎉 SUCCESS! Created ${totalVariantsCreated} Product Variants across all ${products.length} products!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding product variants:', err);
    process.exit(1);
  }
}

seedProductVariants();
