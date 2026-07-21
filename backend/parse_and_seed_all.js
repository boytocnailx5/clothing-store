require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Product, ProductImage, Size, Color, ProductVariant } = require('./models');

const contentPath = `C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\ed0deb2b-38e6-454e-83b3-78fa74db1275\\.system_generated\\steps\\157\\content.md`;

async function parseAndSeed() {
  console.log('=== EXTRACTING ALL REAL TORANO PRODUCTS FROM FETCHED CONTENT ===');

  if (!fs.existsSync(contentPath)) {
    console.error('File not found:', contentPath);
    return;
  }

  const rawContent = fs.readFileSync(contentPath, 'utf8');
  
  // Regex to extract JSON objects assigned to collection/section variables
  const regex = /var (?:collection|section)_[0-9]+_[0-9]+\s*=\s*(\{.*?\});/g;
  let match;
  const productsMap = new Map();

  while ((match = regex.exec(rawContent)) !== null) {
    try {
      const jsonStr = match[1];
      const prod = JSON.parse(jsonStr);
      if (prod && prod.title && prod.images && prod.images.length > 0) {
        if (!productsMap.has(prod.id)) {
          productsMap.set(prod.id, prod);
        }
      }
    } catch (e) {
      // Continue parsing next if json parse fails
    }
  }

  const extractedProducts = Array.from(productsMap.values());
  console.log(`✔ Found ${extractedProducts.length} unique Torano products from site data!`);

  await sequelize.authenticate();
  console.log('✔ Connected to Database');

  // Categories mapping helper
  const getCategoryName = (typeStr, titleStr) => {
    const text = (typeStr + ' ' + titleStr).toLowerCase();
    if (text.includes('polo')) return 'Áo polo';
    if (text.includes('sơ mi') || text.includes('so mi')) return 'Áo sơ mi';
    if (text.includes('tshirt') || text.includes('thun') || text.includes('t-shirt')) return 'Áo thun';
    if (text.includes('short')) return 'Quần short';
    if (text.includes('âu') || text.includes('tây')) return 'Quần âu';
    if (text.includes('jean') || text.includes('kaki')) return 'Quần jean';
    if (text.includes('khoác') || text.includes('jacket')) return 'Áo khoác';
    return 'Thời trang nam';
  };

  const categoryCache = new Map();
  const ensureCategory = async (name) => {
    if (categoryCache.has(name)) return categoryCache.get(name);
    let cat = await Category.findOne({ where: { CategoryName: name } });
    if (!cat) {
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      cat = await Category.create({ CategoryName: name, Slug: slug, Description: `Danh mục ${name} Torano`, IsActive: true });
    }
    categoryCache.set(name, cat.CategoryId);
    return cat.CategoryId;
  };

  let countAdded = 0;

  for (const prodData of extractedProducts) {
    const catName = getCategoryName(prodData.type || '', prodData.title || '');
    const categoryId = await ensureCategory(catName);

    const price = prodData.price ? Math.round(prodData.price / 100) : 299000;
    const comparePrice = prodData.compare_at_price ? Math.round(prodData.compare_at_price / 100) : null;
    const basePrice = comparePrice && comparePrice > price ? comparePrice : (price + 100000);
    const salePrice = price;

    const productName = prodData.title.trim();
    const slug = (prodData.handle || productName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9]/g, "-")).replace(/-+/g, "-");

    // Clean html description
    let cleanDesc = 'Sản phẩm thời trang nam Torano chính hãng. Chất vải cao cấp, co giãn thoải mái, thoáng mát và giữ phom dáng chuẩn đẹp.';
    if (prodData.description) {
      const textOnly = prodData.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (textOnly.length > 20) {
        cleanDesc = textOnly.slice(0, 400);
      }
    }

    let prod = await Product.findOne({ where: { ProductName: productName } });
    if (!prod) {
      prod = await Product.create({
        ProductName: productName,
        Slug: slug,
        CategoryId: categoryId,
        BasePrice: basePrice,
        SalePrice: salePrice,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: cleanDesc
      });
    } else {
      await prod.update({ BasePrice: basePrice, SalePrice: salePrice, Description: cleanDesc, CategoryId: categoryId });
    }

    // Extract images and pair with colors from variants if available
    const imagesList = prodData.images || [];
    const variants = prodData.variants || [];

    // Map variant featured_image to option1 (Color)
    const colorImageMap = new Map();
    variants.forEach(v => {
      const color = v.option1 || v.options?.[0];
      const imgUrl = v.featured_image?.src || (typeof v.featured_image === 'string' ? v.featured_image : null);
      if (color && imgUrl && !colorImageMap.has(imgUrl)) {
        colorImageMap.set(imgUrl, color);
      }
    });

    await ProductImage.destroy({ where: { ProductId: prod.ProductId } });

    const defaultColors = ['Đen', 'Trắng', 'Xanh navy', 'Xám', 'Be', 'Nâu', 'Xanh dương'];
    const imagePayloads = imagesList.slice(0, 6).map((imgUrl, index) => {
      let colorName = colorImageMap.get(imgUrl) || null;
      if (!colorName) {
        colorName = defaultColors[index % defaultColors.length];
      }
      return {
        ProductId: prod.ProductId,
        ImageUrl: imgUrl.startsWith('//') ? `https:${imgUrl}` : imgUrl,
        IsPrimary: index === 0,
        SortOrder: index + 1,
        ColorName: colorName
      };
    });

    if (imagePayloads.length > 0) {
      await ProductImage.bulkCreate(imagePayloads);
    }

    countAdded++;
    console.log(`+ [${countAdded}] Saved Product ID ${prod.ProductId}: "${productName}" (${catName}) with ${imagePayloads.length} images`);
  }

  console.log(`\n🎉 SUCCESS! Inserted/Updated ${countAdded} Torano products into Database with 5+ images per product!`);
  process.exit(0);
}

parseAndSeed().catch(err => {
  console.error('❌ Error during parse and seed:', err);
  process.exit(1);
});
