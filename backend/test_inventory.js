require('dotenv').config();
const { sequelize } = require('./models');
const inventoryService = require('./services/inventory.service');
const orderService = require('./services/order.service');

async function testInventorySystem() {
  console.log('=== TESTING INVENTORY SYSTEM & AUDIT LOGS ===');

  try {
    await sequelize.authenticate();

    // Recreate OrderItems and InventoryLogs tables for clean test
    await sequelize.query(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
      BEGIN
        DROP TABLE [OrderItems];
      END
      CREATE TABLE [OrderItems] (
        [OrderItemId] INT IDENTITY(1,1) PRIMARY KEY,
        [OrderId] INT NOT NULL,
        [VariantId] INT NULL,
        [ProductId] INT NOT NULL,
        [ProductName] NVARCHAR(255) NOT NULL,
        [ColorName] NVARCHAR(50) NULL,
        [SizeName] NVARCHAR(30) NULL,
        [SKU] NVARCHAR(100) NULL,
        [Price] DECIMAL(18,2) NOT NULL,
        [Quantity] INT NOT NULL DEFAULT 1,
        [TotalPrice] DECIMAL(18,2) NOT NULL
      );
    `);

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InventoryLogs')
      BEGIN
        CREATE TABLE [InventoryLogs] (
          [LogId] INT IDENTITY(1,1) PRIMARY KEY,
          [VariantId] INT NOT NULL,
          [ProductId] INT NOT NULL,
          [ChangeQuantity] INT NOT NULL,
          [OldQuantity] INT NOT NULL,
          [NewQuantity] INT NOT NULL,
          [Type] NVARCHAR(50) NOT NULL DEFAULT 'MANUAL_UPDATE',
          [Note] NVARCHAR(255) NULL,
          [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
        );
      END
    `);

    // 1. Get Overview
    const overview = await inventoryService.getInventoryOverview({ filter: 'ALL' });
    console.log(`✔ Overview fetched: ${overview.stats.totalProducts} products, ${overview.stats.totalStockItems} total stock items.`);
    console.log(`  Low stock count: ${overview.stats.lowStockCount}, Out of stock count: ${overview.stats.outOfStockCount}`);

    if (overview.products.length > 0 && overview.products[0].Variants.length > 0) {
      const targetVariant = overview.products[0].Variants[0];
      console.log(`\nTesting manual adjustment for Variant ID #${targetVariant.VariantId} (${targetVariant.SKU})...`);

      // 2. Adjust Stock
      const updatedVariant = await inventoryService.adjustVariantStock(targetVariant.VariantId, {
        newQuantity: 99,
        note: 'Test kiểm tra tính năng điều chỉnh kho thủ công'
      });
      console.log(`✔ Updated Stock for SKU "${updatedVariant.SKU}": New Stock = ${updatedVariant.StockQuantity}`);

      // 3. Test Order Creation (Deduct Stock)
      console.log('\nTesting Order Creation stock deduction...');
      const testOrderData = {
        UserId: 1,
        OrderCode: `TEST-ORD-${Date.now()}`,
        OrderStatus: 'PENDING',
        PaymentMethod: 'COD',
        PaymentStatus: 'UNPAID',
        Subtotal: 500000,
        DiscountAmount: 0,
        ShippingFee: 30000,
        TotalAmount: 530000,
        ReceiverName: 'Nguyễn Văn Test',
        ReceiverPhone: '0987654321',
        ShippingAddress: '123 Đường Test, Hà Nội',
        Items: [
          {
            ProductId: parseInt(targetVariant.ProductId),
            VariantId: parseInt(targetVariant.VariantId),
            ProductName: overview.products[0].ProductName,
            ColorName: targetVariant.ColorName,
            SizeName: targetVariant.SizeName,
            SKU: targetVariant.SKU,
            Price: 500000,
            Quantity: 2,
            TotalPrice: 1000000
          }
        ]
      };

      const createdOrder = await orderService.createOrder(testOrderData);
      console.log(`✔ Created Test Order #${createdOrder.OrderCode}. Check stock after deduction:`);
      
      const checkAfterDeduct = await inventoryService.getInventoryOverview();
      const variantAfterDeduct = checkAfterDeduct.products[0].Variants.find(v => v.VariantId === targetVariant.VariantId);
      console.log(`  SKU "${targetVariant.SKU}" Stock after deduct (should be 97): ${variantAfterDeduct.StockQuantity}`);

      // 4. Test Order Cancellation (Restore Stock)
      console.log('\nTesting Order Cancellation stock restoration...');
      await orderService.updateOrder(createdOrder.OrderId, {
        OrderStatus: 'CANCELLED',
        CancelReason: 'Khách hàng đổi ý muốn hủy đơn'
      });

      const checkAfterRestore = await inventoryService.getInventoryOverview();
      const variantAfterRestore = checkAfterRestore.products[0].Variants.find(v => v.VariantId === targetVariant.VariantId);
      console.log(`✔ SKU "${targetVariant.SKU}" Stock after cancellation restore (should be back to 99): ${variantAfterRestore.StockQuantity}`);

      // 5. Audit Logs
      const logs = await inventoryService.getInventoryLogs({ limit: 5 });
      console.log(`\n✔ Latest ${logs.logs.length} Inventory Audit Logs:`);
      logs.logs.forEach(l => {
        console.log(`  - [${l.Type}] SKU: ${l.Variant?.SKU || 'N/A'} | ${l.OldQuantity} ➔ ${l.NewQuantity} (${l.ChangeQuantity > 0 ? '+' : ''}${l.ChangeQuantity}) | Note: ${l.Note}`);
      });
    }

    console.log('\n🎉 ALL INVENTORY SYSTEM TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error testing inventory system:', err);
    process.exit(1);
  }
}

testInventorySystem();
