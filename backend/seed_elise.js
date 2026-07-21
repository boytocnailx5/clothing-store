require('dotenv').config();
const { sequelize, Category, Product, ProductImage } = require('./models');

async function seedEliseProducts() {
  console.log('=== POPULATING DB WITH ELISE FEMALE FASHION REAL PRODUCT DATA ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    // 1. Ensure Female Categories exist
    let catDam = await Category.findOne({ where: { CategoryName: 'Đầm nữ' } });
    if (!catDam) {
      catDam = await Category.create({
        CategoryName: 'Đầm nữ',
        Slug: 'dam-nu',
        Description: 'Đầm thời trang nữ thiết kế Elise cao cấp',
        IsActive: true
      });
    }

    let catAoNu = await Category.findOne({ where: { CategoryName: 'Áo nữ' } });
    if (!catAoNu) {
      catAoNu = await Category.create({
        CategoryName: 'Áo nữ',
        Slug: 'ao-nu',
        Description: 'Áo sơ mi, áo kiểu nữ Elise',
        IsActive: true
      });
    }

    let catChanVay = await Category.findOne({ where: { CategoryName: 'Chân váy' } });
    if (!catChanVay) {
      catChanVay = await Category.create({
        CategoryName: 'Chân váy',
        Slug: 'chan-vay',
        Description: 'Chân váy xòe, bút chì nữ Elise',
        IsActive: true
      });
    }

    let catQuanNu = await Category.findOne({ where: { CategoryName: 'Quần nữ' } });
    if (!catQuanNu) {
      catQuanNu = await Category.create({
        CategoryName: 'Quần nữ',
        Slug: 'quan-nu',
        Description: 'Quần tây, quần kiểu nữ công sở Elise',
        IsActive: true
      });
    }

    // 2. Real Elise products list with multiple images per color
    const eliseProducts = [
      {
        ProductName: 'Đầm Tuytsy Kẻ Đỏ Thiết Kế Elise FF25061',
        CategoryId: catDam.CategoryId,
        BasePrice: 2098000,
        SalePrice: 1049000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Đầm Tuytsy kẻ đỏ thanh lịch cao cấp nhà Elise. Thiết kế phom dáng A nhẹ nhàng tôn đường cong quyến rũ, chất vải tuytsy giữ phom chuẩn đẹp cho phái đẹp.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Đỏ', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Đen', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Be', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Đầm Maxi Thô Kẻ Cổ Yếm Elise FS25122',
        CategoryId: catDam.CategoryId,
        BasePrice: 2098000,
        SalePrice: 1049000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Đầm Maxi thô kẻ cổ yếm mang phong cách phóng khoáng, nữ tính. Chất thô đũi tự nhiên thoáng mát, cực kỳ thích hợp cho chuyến du lịch dạo phố.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Trắng', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Hồng', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Vàng', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Đầm Đen Cổ Yếm Bấu Mí Ngực Elise FS26010',
        CategoryId: catDam.CategoryId,
        BasePrice: 2298000,
        SalePrice: 1149000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Đầm đen thiết kế cổ yếm bấu mí ngực sang trọng quý phái. Chất vải cao cấp đứng dáng, phù hợp dự tiệc và sự kiện quan trọng.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Đỏ', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Tím', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Đầm Bút Chì Sạn Vàng Kèm Áo Khoác Elise FF25060',
        CategoryId: catDam.CategoryId,
        BasePrice: 2598000,
        SalePrice: 1299000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Set đầm bút chì sạn vàng kèm áo khoác khoác ngoài phong cách doanh nhân thanh lịch, tôn lên thần thái đẳng cấp chốn công sở.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Vàng', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Trắng', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Be', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Áo Sơ Mi Lụa Cổ V Công Sở Elise AF2401',
        CategoryId: catAoNu.CategoryId,
        BasePrice: 1598000,
        SalePrice: 899000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Áo sơ mi lụa tơ tằm mềm mại mướt da, thiết kế cổ V nhẹ nhàng nữ tính, phối cùng quần tây hoặc chân váy cực kỳ chỉn chu.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Trắng', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Hồng', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Xanh dương', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Chân Váy Xếp Ly Dáng Xòe Elise SK2502',
        CategoryId: catChanVay.CategoryId,
        BasePrice: 1498000,
        SalePrice: 799000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Chân váy xếp ly dáng xòe thời trang nữ tính. Đường xếp ly tỉ mỉ, độ phồng vừa phải di chuyển uyển chuyển thanh thoát.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Be', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Trắng', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Quần Tây Nữ Slim-Fit Cạp Cao Elise PT2508',
        CategoryId: catQuanNu.CategoryId,
        BasePrice: 1798000,
        SalePrice: 949000,
        Gender: 'FEMALE',
        Status: 'ACTIVE',
        Description: 'Quần tây nữ cạp cao tôn dáng hack chân cực đỉnh. Chất vải tuytsi co giãn nhẹ, không nhăn xù thích hợp cho phái đẹp công sở.',
        Images: [
          { ImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85', IsPrimary: true, ColorName: 'Đen', SortOrder: 1 },
          { ImageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Xám', SortOrder: 2 },
          { ImageUrl: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=1000&q=85', IsPrimary: false, ColorName: 'Trắng', SortOrder: 3 }
        ]
      }
    ];

    let countAdded = 0;
    for (const item of eliseProducts) {
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
        console.log(`+ Created Elise product: ${item.ProductName}`);
      } else {
        await prod.update({
          BasePrice: item.BasePrice,
          SalePrice: item.SalePrice,
          Description: item.Description
        });
        console.log(`~ Updated Elise product: ${item.ProductName}`);
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
      countAdded++;
      console.log(`  └ Inserted ${imgPayloads.length} images with colors for Product ID ${prod.ProductId}`);
    }

    console.log(`\n🎉 SUCCESS! Inserted ${countAdded} Elise female fashion products into Database!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Elise products:', err);
    process.exit(1);
  }
}

seedEliseProducts();
