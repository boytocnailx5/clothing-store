require('dotenv').config();
const { sequelize, Category, Product, ProductImage } = require('./models');

async function seedToranoJeans() {
  console.log('=== POPULATING DB WITH 5 REAL TORANO JEANS (QUẦN JEAN) PRODUCTS ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    // Ensure 'Quần jean' category exists
    let catQuanJean = await Category.findOne({ where: { CategoryName: 'Quần jean' } });
    if (!catQuanJean) {
      catQuanJean = await Category.create({
        CategoryName: 'Quần jean',
        Slug: 'quan-jean',
        Description: 'Quần jean nam Torano co giãn, phom dáng hiện đại',
        IsActive: true
      });
    }

    const jeansData = [
      {
        ProductName: 'Quần jeans basic phom Straight-fit FABJ003',
        CategoryId: catQuanJean.CategoryId,
        BasePrice: 650000,
        SalePrice: 449000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần Jean basic FABJ003 từ nhà Torano vừa lịch sự vừa thoải mái. Mẫu jeans trơn hiện đại phom Straight fit cùng chất jeans co giãn nhẹ bền màu sau nhiều lần giặt.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/t892_fbc0cf714e164de98134b95eb8c8b6e0.png', IsPrimary: true, ColorName: 'Dark Navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/fabj003-6_54978749041_o_346567c6c9344886a4cecea2af68e0f3.jpg', IsPrimary: false, ColorName: 'Xanh da trời đậm', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/fabj003-7_54979048290_o_c11daf4094444a07a3629019f97cf4d8.jpg', IsPrimary: false, ColorName: 'Xanh da trời nhạt', SortOrder: 3 }
        ]
      },
      {
        ProductName: 'Quần Jeans basic regularfit thêu logo GABJ896',
        CategoryId: catQuanJean.CategoryId,
        BasePrice: 750000,
        SalePrice: 599000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Không bó quá, không rộng quá, chiếc quần Jeans basic regularfit GABJ896 mới là lựa chọn hoàn hảo cho mọi dáng người. Chất denim bền, co giãn nhẹ giữ phom chuẩn đẹp.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/qu_n_web_c4760d0842194badb63e5c47542644b7.png', IsPrimary: true, ColorName: 'Xám Melange', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_1944_54929012184_o_9f5e841b2f0f4a749330cdf395138745.jpg', IsPrimary: false, ColorName: 'Xanh denim', SortOrder: 2 }
        ]
      },
      {
        ProductName: 'Quần Jeans basic regularfit thêu logo túi GABJ902',
        CategoryId: catQuanJean.CategoryId,
        BasePrice: 699000,
        SalePrice: 499000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần Jeans basic regularfit GABJ902 mới trẻ trung, phom ống đứng che khuyết điểm tốt giúp anh thoải mái lên đồ không phải nghĩ. Lựa chọn cho ngày bận rộn nhưng vẫn đẹp nhanh gọn.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/bj902_a5e1046e5223402a95dda9f8409d307f.png', IsPrimary: true, ColorName: 'Xanh đá', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_dsc8689_55040432944_o_b8effeb5a0ca4a4bb54dc4d9f652a425.jpg', IsPrimary: false, ColorName: 'Xanh đá', SortOrder: 2 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_dsc8696_55040432899_o_266a8da510bb4311809a1b33833a77d1.jpg', IsPrimary: false, ColorName: 'Xanh da trời phai', SortOrder: 3 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/_dsc8675_55040515720_o_6088234d5f49408ba169e23ba6a09462.jpg', IsPrimary: false, ColorName: 'Xanh da trời đậm', SortOrder: 4 }
        ]
      },
      {
        ProductName: 'Quần Jeans basic relaxedfit co giãn GABJ302',
        CategoryId: catQuanJean.CategoryId,
        BasePrice: 850000,
        SalePrice: 699000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần Jeans basic relaxedfit GABJ302 từ nhà Torano là 1 item vừa lịch sự nhưng cũng rất thoải mái. Mẫu jeans trơn hiện đại với phom relaxed fit thoải mái cùng chất jeans co giãn 4 chiều.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/qu_n_web_fc8dbced49084e6e986c7b2134fd9de9.png', IsPrimary: true, ColorName: 'Grey Sand', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_1831_54866468841_o_101b179cc4d74948a4ba421eac2afe37.jpg', IsPrimary: false, ColorName: 'Xanh xám', SortOrder: 2 }
        ]
      },
      {
        ProductName: 'Quần Jeans Slim-fit co giãn năng động FABJ800',
        CategoryId: catQuanJean.CategoryId,
        BasePrice: 750000,
        SalePrice: 550000,
        Gender: 'MALE',
        Status: 'ACTIVE',
        Description: 'Quần Jeans Slim-fit FABJ800 phong cách trẻ trung năng động. Chất denim dày dặn vừa phải, độ đàn hồi cao giúp đôi chân luôn thoải mái khi sải bước.',
        Images: [
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_1842_54866722544_o_3b05a30a40424f049b7e0839992dcaf4.jpg', IsPrimary: true, ColorName: 'Xanh navy', SortOrder: 1 },
          { ImageUrl: 'https://cdn.hstatic.net/products/200000690725/img_1845_54865621087_o_e6cb919522c94a529f6c0ae817b60dd9.jpg', IsPrimary: false, ColorName: 'Xanh nhạt', SortOrder: 2 }
        ]
      }
    ];

    let count = 0;
    for (const item of jeansData) {
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
        console.log(`+ Created Jeans product: ${item.ProductName}`);
      } else {
        await prod.update({
          BasePrice: item.BasePrice,
          SalePrice: item.SalePrice,
          Description: item.Description,
          CategoryId: item.CategoryId
        });
        console.log(`~ Updated Jeans product: ${item.ProductName}`);
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

    console.log(`\n🎉 SUCCESS! Inserted ${count} Torano Jeans products into Database!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Torano jeans:', err);
    process.exit(1);
  }
}

seedToranoJeans();
