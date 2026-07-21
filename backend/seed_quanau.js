require('dotenv').config();
const { sequelize, Category, Product, ProductImage } = require('./models');

async function seedToranoQuanAu() {
  console.log('=== POPULATING DB WITH 5 REAL TORANO DRESS PANTS (QUẦN ÂU) PRODUCTS ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    // Ensure 'Quần âu' category exists
    let catQuanAu = await Category.findOne({ where: { CategoryName: 'Quần âu' } });
    if (!catQuanAu) {
      catQuanAu = await Category.create({
        CategoryName: 'Quần âu',
        Slug: 'quan-au',
        Description: 'Quần âu nam công sở Torano cao cấp',
        IsActive: true
      });
    }

    const quanAuData = [
      {
        ProductName: 'Quần âu regular cạp lót in logo Torano GABT003',
        CategoryId: catQuanAu.CategoryId,
        BasePrice: 800000,
        SalePrice: 650000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần âu regular cạp lót in logo GABT003 với form dáng regular cạp lót họa tiết chuẩn chỉnh, kết hợp điểm nhấn tinh tế tôn dáng bảnh bao cho anh chàng công sở.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/qu_n_web_65ffc59d12b745fba7dee5a5aa8b9ba6.png', IsPrimary: true, ColorName: 'Xanh navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/dscf0120_54597108136_o_ec9cfd7961654cffbe9b0c4e2a6b2cfd.jpg', IsPrimary: false, ColorName: 'Xanh navy', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/dscf0137_54596237212_o_862a215070b2435c9c6e4e087cbc2db7.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Quần âu regularfit trơn công sở GABT004',
        CategoryId: catQuanAu.CategoryId,
        BasePrice: 800000,
        SalePrice: 650000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần âu regularfit trơn GABT004 với form dáng regularfit chuẩn phom lịch thiệp, dễ dàng kết hợp cùng áo sơ mi hoặc polo đi làm đi sự kiện.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/t004_f19e07fa17354b6e9091ce19d16beb08.png', IsPrimary: true, ColorName: 'Xanh navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_0436_54851172983_o_5d0396bd3a424e079b08d9fcfeb7f41a.jpg', IsPrimary: false, ColorName: 'Xanh navy', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_0828_54871498921_o_8561e87440e24256afb65c2b737227dd.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Quần âu regularfit trơn túi chéo thêu logo GABT891',
        CategoryId: catQuanAu.CategoryId,
        BasePrice: 850000,
        SalePrice: 649000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần âu regularfit trơn túi chéo thêu logo GABT891 che khuyết điểm đôi chân cực tốt. Khả năng chống nhăn phẳng phiu giúp chiếc quần duy trì phong thái suốt cả ngày.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/t891_3eead5a7f97e4c649b40221367f517f5.png', IsPrimary: true, ColorName: 'Dark Navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_4529xanh1_54907137313_o_934a78fe7a5c43e5b9cd163fa2cb6d4e.jpg', IsPrimary: false, ColorName: 'Dark Navy', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_4529en1_54906910606_o_33995de49194411bbe735b2f1b69fc7b.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 3 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_4529trng1_54907223895_o_d1669dd5f0644b0991b7f3207983ecf5.jpg', IsPrimary: false, ColorName: 'Be', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Quần âu relaxedfit trơn phối cạp chun GABT506',
        CategoryId: catQuanAu.CategoryId,
        BasePrice: 890000,
        SalePrice: 699000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần âu relaxedfit trơn phối cạp chun GABT506 co giãn nhẹ nhàng ở eo giúp cử động dễ chịu tối đa mà vẫn giữ được sự lịch lãm bảnh bao.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/bt506_7c8b9ff440fb4afeb027dd1c8944beea.png', IsPrimary: true, ColorName: 'Xám đậm', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/gabt506_54987438224_o_a8a5093cf741468ea20e8fc04e8970a5.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 2 }
        ]
      },
      {
        ProductName: 'Quần âu sidetab đai chun thông minh HABT808',
        CategoryId: catQuanAu.CategoryId,
        BasePrice: 950000,
        SalePrice: 749000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần âu sidetab HABT808 đai cạp side tab tự động điều chỉnh linh hoạt không lo chật bụng, phom dáng Slimfit tôn chiều cao cực kỳ hiệu quả.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/bt503_b9078e0f87d44d12842a626f4edf8135.png', IsPrimary: true, ColorName: 'Dark Navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/habt808-1_55204449280_o_7b62a0230406412bae7bbba59b8d4a2a.jpg', IsPrimary: false, ColorName: 'Đen', SortOrder: 2 }
        ]
      }
    ];

    let count = 0;
    for (const item of quanAuData) {
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
        console.log(`+ Created Quan Au product: ${item.ProductName}`);
      } else {
        await prod.update({
          BasePrice: item.BasePrice,
          SalePrice: item.SalePrice,
          Description: item.Description,
          CategoryId: item.CategoryId
        });
        console.log(`~ Updated Quan Au product: ${item.ProductName}`);
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

    console.log(`\n🎉 SUCCESS! Inserted ${count} Torano Dress Pants (Quần âu) products into Database!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Torano dress pants:', err);
    process.exit(1);
  }
}

seedToranoQuanAu();
