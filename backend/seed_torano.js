require('dotenv').config();
const { sequelize, Category, Product, ProductImage, Size, Color, ProductVariant } = require('./models');

async function seedToranoProducts() {
  console.log('=== POPULATING DB WITH EXTENDED TORANO REAL PRODUCT DATA ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    // 1. Ensure Categories exist
    let catAoPolo = await Category.findOne({ where: { CategoryName: 'Áo polo' } });
    if (!catAoPolo) {
      catAoPolo = await Category.create({ CategoryName: 'Áo polo', Slug: 'ao-polo', Description: 'Áo polo nam Torano cao cấp', IsActive: true });
    }

    let catAoThun = await Category.findOne({ where: { CategoryName: 'Áo thun' } });
    if (!catAoThun) {
      catAoThun = await Category.create({ CategoryName: 'Áo thun', Slug: 'ao-thun', Description: 'Áo thun nam thể thao năng động Torano', IsActive: true });
    }

    let catQuanShort = await Category.findOne({ where: { CategoryName: 'Quần short' } });
    if (!catQuanShort) {
      catQuanShort = await Category.create({ CategoryName: 'Quần short', Slug: 'quan-short', Description: 'Quần short thể thao nam Torano', IsActive: true });
    }

    let catQuanAu = await Category.findOne({ where: { CategoryName: 'Quần âu' } });
    if (!catQuanAu) {
      catQuanAu = await Category.create({ CategoryName: 'Quần âu', Slug: 'quan-au', Description: 'Quần âu nam công sở Torano', IsActive: true });
    }

    let catSoMi = await Category.findOne({ where: { CategoryName: 'Áo sơ mi' } });
    if (!catSoMi) {
      catSoMi = await Category.create({ CategoryName: 'Áo sơ mi', Slug: 'ao-so-mi', Description: 'Áo sơ mi nam lịch lãm Torano', IsActive: true });
    }

    // 2. Torano real products list with multiple images per color
    const productsData = [
      {
        ProductName: 'Áo Polo Trơn Basic Logo Ngực Torano ESTP038',
        CategoryId: catAoPolo.CategoryId,
        BasePrice: 400000,
        SalePrice: 269000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Áo Polo trơn TORANO cổ bẻ tay ngắn trơn, bo kẻ nhiều màu ESTP038 chính là item hoàn hảo dễ mặc dễ phối đồ cho nam giới. Chất vải co giãn tốt, thoáng khí, thấm hút mồ hôi tối đa và giữ phom chuẩn đẹp.',
        Images: [
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/7_4d50f92cb2ff4039b3f7cfbc1f0509f6.png', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/tp038---bt019-den_3__aad19632f25a4e49913e1d80e2a5919c.jpg', IsPrimary: false, ColorName: 'Xanh dương', SortOrder: 2 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/tp038-42_52761813873_o_20dead3d93b34d1188bea7b4ce83cd3d.jpg', IsPrimary: false, ColorName: 'Trắng', SortOrder: 3 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/tp038-43_52761730015_o_888bb61714e74a46b53ce1448cd8d7a9.jpg', IsPrimary: false, ColorName: 'Nâu', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Quần Short Gió Thể Thao Đục Lỗ Sườn Torano BW600',
        CategoryId: catQuanShort.CategoryId,
        BasePrice: 249000,
        SalePrice: 189000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần Short gió thể thao đục lỗ sườn BW600 cao cấp chất vải Gió chun mềm mại co giãn vận động thoải mái, vô cùng thoáng mát cho mùa hè.',
        Images: [
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bw600_82451b6d03bc40ada574ce3f8401df2f.jpg', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bw600_538ca8fce00845c4bbe47045625e1b75.jpg', IsPrimary: false, ColorName: 'Xanh navy', SortOrder: 2 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bw600-2_1cd20d9a14fb4b9e9f9a4706dd12dcd7.jpg', IsPrimary: false, ColorName: 'Xám', SortOrder: 3 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bw600-4_acb5488d75e342ac8760927c8de7bf0e.jpg', IsPrimary: false, ColorName: 'Xám đậm', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Quần Ân Slim-Fit Cạp Trơn Công Sở Torano DABT900',
        CategoryId: catQuanAu.CategoryId,
        BasePrice: 650000,
        SalePrice: 499000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần âu nam slim-fit cạp trơn DABT900 với form dáng chuẩn chỉnh, lót cạp cao cấp tôn dáng tự nhiên, mang lại vẻ ngoài lịch lãm bảnh bao.',
        Images: [
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bt900_afe890ccab214119b1fcb9b0340878f9.jpg', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bt900-1_52987832886_o_49d7e74a829b4063b378dfe160b96fe4.jpg', IsPrimary: false, ColorName: 'Xám', SortOrder: 2 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/bt900-13_52987833246_o_d294306c3a954507a0daf2cfc1e46984.jpg', IsPrimary: false, ColorName: 'Xanh navy', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Áo Sơ Mi Nam Tay Dài Oxford Classic Torano',
        CategoryId: catSoMi.CategoryId,
        BasePrice: 550000,
        SalePrice: 389000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Áo sơ mi Oxford Classic chất liệu cotton chống nhăn nhẹ, phom Regular tôn dáng lịch thiệp cho môi trường công sở và sự kiện.',
        Images: [
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/54058892734_0b9029cd7f_c_25c7109b3fd7426eb926399034cd944b.jpg', IsPrimary: true, ColorName: 'Trắng', SortOrder: 1 },
          { ImageUrl: 'https://product.hstatic.net/200000690725/product/tp038-44_52761813818_o_3c7be9734f504ab2a937d3a5f62f80d2.jpg', IsPrimary: false, ColorName: 'Xanh dương', SortOrder: 2 }
        ]
      },
      {
        ProductName: 'Áo Tshirt Active Smart Pace Torano HSTS902',
        CategoryId: catAoThun.CategoryId,
        BasePrice: 450000,
        SalePrice: 279000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Smart Pace Tee HSTS902 nhà Torano sở hữu chất liệu siêu nhẹ, co giãn 4 chiều linh hoạt và khả năng nhanh khô vượt trội, thoải mái vận động suốt ngày dài.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/tp302__1__b4ceda20537d462fbddc00e7f249a25d.png', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_dsc0005_55309557789_o_4448d9c3f0b644dbb779e4387c35dc14.jpg', IsPrimary: false, ColorName: 'Trắng', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_dsc0009_55308421242_o_d4368d5eacf84fde9da2c55cfae343b2.jpg', IsPrimary: false, ColorName: 'Xám nhạt', SortOrder: 3 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/55331724674_d477135883_c_09c515a2e23144e7a1e052d8625de5e3.jpg', IsPrimary: false, ColorName: 'Nâu', SortOrder: 4 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/55331662033_07c30073df_c_62855f03e46d44d493f4bdfe1b3dd9f3.jpg', IsPrimary: false, ColorName: 'Xám đậm', SortOrder: 5 }
        ]
      },
      {
        ProductName: 'Quần Short Khaki Cao Cấp Torano HSBK800',
        CategoryId: catQuanShort.CategoryId,
        BasePrice: 650000,
        SalePrice: 490000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần Short Khaki HSBK800 chuẩn phom tôn dáng, chất liệu kaki chọn lọc không nhăn xù, thoáng mát cực kỳ dễ phối cùng áo thun hoặc sơ mi.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_dsc9958_55296710953_o_d914b585d78643ef82d25a64f6961914.jpg', IsPrimary: true, ColorName: 'Xanh navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_esc9958xam_55296978635_o_032ccccbecd546309e542ae66ae62edc.jpg', IsPrimary: false, ColorName: 'Xám đậm', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/bt506_e7f8c723bf8d430dab1a88ee23374b7e.png', IsPrimary: false, ColorName: 'Be', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Áo Sơ Mi Ngắn Tay Trơn Smart Fabric Torano HSTB301',
        CategoryId: catSoMi.CategoryId,
        BasePrice: 750000,
        SalePrice: 650000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Sơ mi ngắn tay trơn HSTB301 công nghệ Smart Fabric kết hợp giữa Cotton và Linen mang lại cảm giác êm ái, thoáng khí cho nhịp sống hiện đại.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_o_web__1__03d9a8db42b4430a8c43d3c42f9379b5.png', IsPrimary: true, ColorName: 'Xanh da trời', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/hstb301-44_55264200837_o_f2aebb99af444199887d58cb417e5694.jpg', IsPrimary: false, ColorName: 'Xám nhạt', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/hstb301-59_55265504965_o_78ba83559d274d82934c521a40cf3426.jpg', IsPrimary: false, ColorName: 'Trắng', SortOrder: 3 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/hstb301-61_55264200302_o_69d1fa0f4e5a4c1f9a05d8d89426baa1.jpg', IsPrimary: false, ColorName: 'Xám rêu', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Áo Sơ Mi Dài Tay Smart Linen Torano HATB301',
        CategoryId: catSoMi.CategoryId,
        BasePrice: 790000,
        SalePrice: 690000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Sơ mi dài tay Smart Linen HATB301 phong cách bảnh bao, tối ưu trải nghiệm mặc linh hoạt suốt ngày dài từ công sở đến cuộc hẹn gặp đối tác.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/hstb301-59_55265504965_o_78ba83559d274d82934c521a40cf3426.jpg', IsPrimary: true, ColorName: 'Trắng', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_o_web__1__03d9a8db42b4430a8c43d3c42f9379b5.png', IsPrimary: false, ColorName: 'Xanh da trời', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/hstb301-61_55264200302_o_69d1fa0f4e5a4c1f9a05d8d89426baa1.jpg', IsPrimary: false, ColorName: 'Xám rêu', SortOrder: 3 }
        ]
      }
    ];

    for (const item of productsData) {
      // Check existing product by name
      let prod = await Product.findOne({ where: { ProductName: item.ProductName } });
      const slug = item.ProductName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      
      if (!prod) {
        prod = await Product.create({
          ProductName: item.ProductName,
          Slug: slug,
          CategoryId: item.CategoryId,
          BasePrice: item.BasePrice,
          SalePrice: item.SalePrice,
          Gender: item.Gender,
          Status: item.Status,
          Description: item.Description
        });
        console.log(`+ Created product: ${item.ProductName}`);
      } else {
        await prod.update({
          BasePrice: item.BasePrice,
          SalePrice: item.SalePrice,
          Description: item.Description
        });
        console.log(`~ Updated existing product: ${item.ProductName}`);
      }

      // Sync Images for product
      await ProductImage.destroy({ where: { ProductId: prod.ProductId } });
      const imgPayloads = item.Images.map(img => ({
        ProductId: prod.ProductId,
        ImageUrl: img.ImageUrl,
        IsPrimary: img.IsPrimary,
        SortOrder: img.SortOrder,
        ColorName: img.ColorName
      }));
      await ProductImage.bulkCreate(imgPayloads);
      console.log(`  └ Inserted ${imgPayloads.length} images with colors for Product ID ${prod.ProductId}`);
    }

    console.log('\n✔ All Torano products successfully seeded into Database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Torano products:', err);
    process.exit(1);
  }
}

seedToranoProducts();
