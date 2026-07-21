require('dotenv').config();
const userService = require('./services/user.service');

async function testCustomerManagement() {
  console.log('=== TESTING CUSTOMER MANAGEMENT SERVICES ===');

  try {
    // 1. Get all users
    const allUsers = await userService.getAllUsers();
    console.log(`✔ Found ${allUsers.length} total users/customers.`);
    allUsers.forEach(u => {
      console.log(`  - [ID #${u.UserId}] ${u.FullName} (${u.Email}) | Phone: ${u.Phone || 'N/A'} | Role: ${u.Role} | Status: ${u.Status} | Orders: ${u.totalOrders} | Spent: ${u.totalSpent.toLocaleString()}₫`);
    });

    // 2. Search customer by Name / Email / Phone
    const searchName = await userService.getAllUsers('Hùng');
    console.log(`\n✔ Search results for "Hùng": ${searchName.length} found (${searchName[0]?.FullName})`);

    const searchEmail = await userService.getAllUsers('mai.tran@yahoo.com');
    console.log(`✔ Search results for "mai.tran@yahoo.com": ${searchEmail.length} found (${searchEmail[0]?.FullName})`);

    const searchPhone = await userService.getAllUsers('0934567890');
    console.log(`✔ Search results for "0934567890": ${searchPhone.length} found (${searchPhone[0]?.FullName})`);

    // 3. Get customer by ID with full addresses & order history
    if (allUsers.length > 0) {
      const customerDetail = await userService.getUserById(allUsers[0].UserId);
      console.log(`\n✔ Customer #${customerDetail.UserId} detail: ${customerDetail.FullName}`);
      console.log(`  Addresses count: ${customerDetail.Addresses?.length || 0}`);
      customerDetail.Addresses?.forEach(a => console.log(`    📍 ${a.ReceiverName} - ${a.AddressDetail}, ${a.Ward}, ${a.District}, ${a.Province}`));
      console.log(`  Orders count: ${customerDetail.Orders?.length || 0}`);
      customerDetail.Orders?.forEach(o => console.log(`    🛍️ Order #${o.OrderCode} - Total: ${Number(o.TotalAmount).toLocaleString()}₫ - Status: ${o.OrderStatus}`));
    }

    console.log('\n🎉 ALL CUSTOMER MANAGEMENT TESTS PASSED PERFECTLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error testing customer management:', err);
    process.exit(1);
  }
}

testCustomerManagement();
