require('dotenv').config();
const { sequelize } = require('./models');

async function test() {
  try {
    await sequelize.query(`SELECT [Coupon].[CouponId], [Coupon].[Code], [Coupon].[Name], [Coupon].[Description], [Coupon].[DiscountType], [Coupon].[DiscountValue], [Coupon].[MinOrderValue], [Coupon].[MaxDiscountAmount], [Coupon].[UsageLimit], [Coupon].[UsedCount], [Coupon].[UsageLimitPerUser], [Coupon].[ApplyTo], [Coupon].[StartDate], [Coupon].[EndDate], [Coupon].[IsActive], [Coupon].[CreatedAt], [Categories].[CategoryId] AS [Categories.CategoryId], [Categories].[CategoryName] AS [Categories.CategoryName], [Categories->CouponCategory].[CouponId] AS [Categories.CouponCategory.CouponId], [Categories->CouponCategory].[CategoryId] AS [Categories.CouponCategory.CategoryId], [Products].[ProductId] AS [Products.ProductId], [Products].[ProductName] AS [Products.ProductName], [Products->CouponProduct].[CouponId] AS [Products.CouponProduct.CouponId], [Products->CouponProduct].[ProductId] AS [Products.CouponProduct.ProductId] FROM [Coupons] AS [Coupon] LEFT OUTER JOIN ( [CouponCategories] AS [Categories->CouponCategory] INNER JOIN [Categories] AS [Categories] ON [Categories].[CategoryId] = [Categories->CouponCategory].[CategoryId]) ON [Coupon].[CouponId] = [Categories->CouponCategory].[CouponId] LEFT OUTER JOIN ( [CouponProducts] AS [Products->CouponProduct] INNER JOIN [Products] AS [Products] ON [Products].[ProductId] = [Products->CouponProduct].[ProductId]) ON [Coupon].[CouponId] = [Products->CouponProduct].[CouponId]`);
    console.log('Success');
  } catch (err) {
    if (err.original) {
      console.error('SQL Error Message:', err.original.message);
      if (err.original.errors) {
        err.original.errors.forEach(e => console.error(e.message));
      }
    } else {
      console.error(err);
    }
  }
}
test();

test();
