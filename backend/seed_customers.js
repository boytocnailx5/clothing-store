require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Address, Order, OrderItem, Product, ProductVariant } = require('./models');

async function seedCustomersData() {
  console.log('=== SEEDING CUSTOMERS, ADDRESSES & PURCHASE HISTORY ===');

  try {
    await sequelize.authenticate();
    console.log('✔ Connected to Database');

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('123456', salt);

    const customersData = [
      {
        FullName: 'Nguyễn Văn Hùng',
        Email: 'hung.nguyen@gmail.com',
        Phone: '0912345678',
        PasswordHash: passHash,
        Role: 'CUSTOMER',
        Status: 'ACTIVE',
        addresses: [
          {
            ReceiverName: 'Nguyễn Văn Hùng',
            ReceiverPhone: '0912345678',
            Province: 'Hà Nội',
            District: 'Quận Cầu Giấy',
            Ward: 'Phường Dịch Vọng',
            AddressDetail: 'Số 15 Ngõ 80 Cầu Giấy',
            IsDefault: true
          },
          {
            ReceiverName: 'Nguyễn Văn Hùng (Cơ quan)',
            ReceiverPhone: '0912345678',
            Province: 'Hà Nội',
            District: 'Quận Nam Từ Liêm',
            Ward: 'Phường Mỹ Đình 2',
            AddressDetail: 'Tầng 5 Tòa nhà Keangnam, đường Phạm Hùng',
            IsDefault: false
          }
        ]
      },
      {
        FullName: 'Trần Thị Mai',
        Email: 'mai.tran@yahoo.com',
        Phone: '0987654321',
        PasswordHash: passHash,
        Role: 'CUSTOMER',
        Status: 'ACTIVE',
        addresses: [
          {
            ReceiverName: 'Trần Thị Mai',
            ReceiverPhone: '0987654321',
            Province: 'TP. Hồ Chí Minh',
            District: 'Quận 1',
            Ward: 'Phường Bến Nghé',
            AddressDetail: '45 Lê Duẩn',
            IsDefault: true
          }
        ]
      },
      {
        FullName: 'Lê Hoàng Anh',
        Email: 'hoanganh.le@gmail.com',
        Phone: '0905123456',
        PasswordHash: passHash,
        Role: 'CUSTOMER',
        Status: 'BLOCKED',
        addresses: [
          {
            ReceiverName: 'Lê Hoàng Anh',
            ReceiverPhone: '0905123456',
            Province: 'Đà Nẵng',
            District: 'Quận Hải Châu',
            Ward: 'Phường Thạch Thang',
            AddressDetail: '12 Nguyễn Thị Minh Khai',
            IsDefault: true
          }
        ]
      },
      {
        FullName: 'Phạm Minh Tuấn',
        Email: 'tuan.pham@outlook.com',
        Phone: '0934567890',
        PasswordHash: passHash,
        Role: 'CUSTOMER',
        Status: 'ACTIVE',
        addresses: [
          {
            ReceiverName: 'Phạm Minh Tuấn',
            ReceiverPhone: '0934567890',
            Province: 'Hải Phòng',
            District: 'Quận Hồng Bàng',
            Ward: 'Phường Minh Khai',
            AddressDetail: '88 Điện Biên Phủ',
            IsDefault: true
          }
        ]
      }
    ];

    // Find some products & variants to generate real purchase history
    const products = await Product.findAll({ limit: 5 });

    for (const cData of customersData) {
      const addresses = cData.addresses;
      delete cData.addresses;

      let user = await User.findOne({ where: { Email: cData.Email } });
      if (!user) {
        user = await User.create(cData);
        console.log(`+ Created customer: ${user.FullName} (${user.Email})`);
      } else {
        await user.update(cData);
        console.log(`~ Updated customer: ${user.FullName}`);
      }

      // Add addresses
      await Address.destroy({ where: { UserId: user.UserId } });
      for (const addr of addresses) {
        await Address.create({ ...addr, UserId: user.UserId });
      }

      // Add orders if user is ACTIVE
      if (user.Status === 'ACTIVE' && products.length > 0) {
        await Order.destroy({ where: { UserId: user.UserId } });

        const p1 = products[0];
        const p2 = products[1] || products[0];

        const orderCode = `ORD-${user.UserId}-${Math.floor(1000 + Math.random() * 9000)}`;
        const totalAmt = parseFloat(p1.BasePrice || 450000) + parseFloat(p2.BasePrice || 350000) + 30000;

        const order = await Order.create({
          UserId: user.UserId,
          OrderCode: orderCode,
          OrderStatus: 'COMPLETED',
          PaymentMethod: 'COD',
          PaymentStatus: 'PAID',
          Subtotal: totalAmt - 30000,
          DiscountAmount: 0,
          ShippingFee: 30000,
          TotalAmount: totalAmt,
          ReceiverName: addresses[0].ReceiverName,
          ReceiverPhone: addresses[0].ReceiverPhone,
          ShippingAddress: `${addresses[0].AddressDetail}, ${addresses[0].Ward}, ${addresses[0].District}, ${addresses[0].Province}`
        });

        await OrderItem.create({
          OrderId: order.OrderId,
          ProductId: p1.ProductId,
          ProductName: p1.ProductName,
          Price: p1.BasePrice,
          Quantity: 1,
          TotalPrice: p1.BasePrice
        });

        await OrderItem.create({
          OrderId: order.OrderId,
          ProductId: p2.ProductId,
          ProductName: p2.ProductName,
          Price: p2.BasePrice,
          Quantity: 1,
          TotalPrice: p2.BasePrice
        });

        console.log(`  + Created Order #${order.OrderCode} (${totalAmt.toLocaleString()}₫) for ${user.FullName}`);
      }
    }

    console.log('\n🎉 SUCCESS! Customers, addresses, and purchase histories seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding customer data:', err);
    process.exit(1);
  }
}

seedCustomersData();
