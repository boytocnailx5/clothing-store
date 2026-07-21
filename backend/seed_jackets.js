require('dotenv').config();
const { sequelize, Category, Product, ProductImage } = require('./models');

async function seedToranoJackets() {
  console.log('=== POPULATING DB WITH 5 REAL TORANO JACKET PRODUCTS ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    // Ensure 'Áo khoác' category exists
    let catAoKhoac = await Category.findOne({ where: { CategoryName: 'Áo khoác' } });
    if (!catAoKhoac) {
      catAoKhoac = await Category.create({
        CategoryName: 'Áo khoác',
        Slug: 'ao-khoac',
        Description: 'Áo khoác nam Torano phao, dạ, gió cao cấp',
        IsActive: true
      });
    }

    const jacketsData = [
      {
        ProductName: 'Áo khoác phao 3 lớp chần bông mũ liền GWCF303',
        CategoryId: catAoKhoac.CategoryId,
        BasePrice: 1699000,
        SalePrice: 1399000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Áo khoác phao 3 lớp chần bông mũ liền GWCF303 của TORANO là bí kíp giữ ấm hoàn hảo cho phái mạnh khi không khí lạnh tăng cường. Chất vải bền đẹp, mềm mịn, lớp chần bông nhẹ và khả năng giữ nhiệt vượt trội giúp anh luôn ấm áp.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/ao-phao-xam-bay_54995169904_o_25fb800f6354457b849d48f12c06c2a5.jpg', IsPrimary: true, ColorName: 'Xám nhạt', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_4729_55018884945_o_9202cbb06ee54bc6a1042929092efa0b.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_4517_54995090803_o_35f2943a52034290b1d8b4fd0cbd42bc.jpg', IsPrimary: false, ColorName: 'Dark Navy', SortOrder: 3 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_4524_54994026507_o_b63d0d91f7f14b11b1c44e2c9ae3de4c.jpg', IsPrimary: false, ColorName: 'Nâu đậm', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Áo khoác phao 3 lớp trơn chần bông cổ cao GWCF302',
        CategoryId: catAoKhoac.CategoryId,
        BasePrice: 1699000,
        SalePrice: 1399000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Dưới nhiệt độ lạnh sâu, áo khoác phao 3 lớp trơn chần bông cổ cao GWCF302 của TORANO sẽ giữ trọn hơi ấm bên trong mà không tạo cảm giác nặng nề nhờ công nghệ chần bông 3 lớp khóa nhiệt hiện đại.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_3070_55000914308_o_1ef2b0624e0c4f508d39de4926c68ba8.jpg', IsPrimary: true, ColorName: 'Trắng', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_3094_55001010004_o_4bbb5ec068b74bd0829d41620c270b83.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_3062_55001010739_o_57b628a0517549bb9da40b8d808f1cec.jpg', IsPrimary: false, ColorName: 'Dark Navy', SortOrder: 3 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_3092_55001010054_o_4c85802255824250b03957a460c9e3ba.jpg', IsPrimary: false, ColorName: 'Xám đậm', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Áo khoác 3 lớp lót bông GWCP901',
        CategoryId: catAoKhoac.CategoryId,
        BasePrice: 1599000,
        SalePrice: 1299000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Áo khoác 3 lớp lót bông GWCP901 phom dáng trẻ trung năng động, lót bông ấm cản gió hiệu quả, thích hợp cho thời tiết chớm đông và trở lạnh.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/bn-sao-img_8239_55038614841_o_a887fab2c3244eaab30fb26d81b23255.jpg', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/bn-sao-img_8246_55038614821_o_7cc2391fca6a49f591a85fcc679aa3b8.jpg', IsPrimary: false, ColorName: 'Dark Navy', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/ao-khoac-_55038614651_o_18016105553240ca867ea99982b4be7f.jpg', IsPrimary: false, ColorName: 'Be', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Áo khoác 2 lớp dạ cổ bẻ thêu logo tay GWCT891',
        CategoryId: catAoKhoac.CategoryId,
        BasePrice: 1599000,
        SalePrice: 1299000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Áo khoác 2 lớp dạ cổ bẻ thêu logo tay GWCT891 phong cách lịch lãm quý phái. Chất dạ cao cấp mịn màng tôn dáng lịch sự cho nam giới.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/gwct891-9_54973969072_o_5ef88c484ea14a0dba968d81b32f4c8c.jpg', IsPrimary: true, ColorName: 'Be', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/54991558855_b507891556_k_3b5eaa245cb04a05814db986e9179b57.jpg', IsPrimary: false, ColorName: 'Xám Melange', SortOrder: 2 }
        ]
      },
      {
        ProductName: 'Áo khoác gió 2 lớp mỏng nhẹ cản nước GWCK901',
        CategoryId: catAoKhoac.CategoryId,
        BasePrice: 999000,
        SalePrice: 799000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Áo khoác gió 2 lớp mỏng nhẹ cản nước GWCK901 của Torano thiết kế đa năng vừa chắn gió cản mưa vừa thời trang gấp gọn tiện di chuyển.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_o_web_52dcb015e80949b6a089eb74f47fe24a.png', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/gwct891_xanh_763be50bda774bb894a8b423b9a8d51f.jpg', IsPrimary: false, ColorName: 'Xanh navy', SortOrder: 2 }
        ]
      }
    ];

    let count = 0;
    for (const item of jacketsData) {
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
        console.log(`+ Created Jacket product: ${item.ProductName}`);
      } else {
        await prod.update({
          BasePrice: item.BasePrice,
          SalePrice: item.SalePrice,
          Description: item.Description,
          CategoryId: item.CategoryId
        });
        console.log(`~ Updated Jacket product: ${item.ProductName}`);
      }

      await ProductImage.destroy({ where: { ProductId: prod.ProductId } });
      const imgPayloads = item.Images.map(img => ({
        ProductId: prod.ProductId,
        ImageUrl: img.ImageUrl,
        IsPrimary: img.IsPrimary,
        SortOrder: img.SortOrder,
        ColorName: img.ColorName
      }));
      await ProductImage.bulkCreate(imgPayloads);
      count++;
      console.log(`  └ Inserted ${imgPayloads.length} images with colors for Product ID ${prod.ProductId}`);
    }

    console.log(`\n🎉 SUCCESS! Inserted ${count} Torano Jacket products into Database!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Torano jackets:', err);
    process.exit(1);
  }
}

seedToranoJackets();
