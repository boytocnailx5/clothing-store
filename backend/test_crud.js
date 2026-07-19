/**
 * CLI Test Script to verify CRUD operations for Category and Product Services.
 * Runs against the Sequelize models and database config.
 * 
 * Usage: node backend/test_crud.js
 */
require('dotenv').config();
const { 
  sequelize, 
  Category, 
  Product, 
  Size, 
  Color, 
  ProductImage, 
  ProductVariant 
} = require('./models');
const categoryService = require('./services/category.service');
const productService = require('./services/product.service');

async function runTests() {
  console.log('=== STARTING DATABASE VERIFICATION ===');
  
  try {
    await sequelize.authenticate();
    console.log('✔ Database connection established successfully.');
  } catch (err) {
    console.error('❌ Database connection failed. Please ensure SQL Server is running and .env configurations are correct.');
    console.error('Error Details:', err.message);
    process.exit(1);
  }

  // Pre-test: ensure Sizes and Colors exist or seed dummy values for testing
  let sizes = await Size.findAll();
  if (sizes.length === 0) {
    console.log('No Sizes found in database. Initializing S, M, L test records.');
    await Size.bulkCreate([
      { SizeName: 'S', SortOrder: 1 },
      { SizeName: 'M', SortOrder: 2 },
      { SizeName: 'L', SortOrder: 3 }
    ]);
    sizes = await Size.findAll();
  } else {
    console.log(`✔ Found ${sizes.length} Sizes in database.`);
  }

  let colors = await Color.findAll();
  if (colors.length === 0) {
    console.log('No Colors found in database. Initializing Black and White test records.');
    await Color.bulkCreate([
      { ColorName: 'Đen', HexCode: '#000000' },
      { ColorName: 'Trắng', HexCode: '#FFFFFF' }
    ]);
    colors = await Color.findAll();
  } else {
    console.log(`✔ Found ${colors.length} Colors in database.`);
  }

  const testSize = sizes[0];
  const testColor = colors[0];

  let testCategory = null;
  let testSubCategory = null;
  let testProduct = null;

  try {
    // ----------------------------------------------------
    // 1. CATEGORY CRUD TEST
    // ----------------------------------------------------
    console.log('\n--- Category Service Tests ---');
    
    // Create Category
    testCategory = await categoryService.createCategory({
      CategoryName: 'Áo Nam Test',
      Description: 'Danh mục áo test dành cho nam'
    });
    console.log('✔ Create Category main success. ID:', testCategory.CategoryId, '| Slug:', testCategory.Slug);

    // Create SubCategory
    testSubCategory = await categoryService.createCategory({
      CategoryName: 'Áo khoác gió Nam Test',
      ParentId: testCategory.CategoryId,
      Description: 'Danh mục áo khoác gió'
    });
    console.log('✔ Create SubCategory success. ID:', testSubCategory.CategoryId, '| Parent:', testSubCategory.ParentId);

    // Get Category Detail
    const fetchedCat = await categoryService.getCategoryById(testCategory.CategoryId);
    console.log('✔ Get Category by ID success:', fetchedCat.CategoryName);
    console.log('  Subcategories count:', fetchedCat.SubCategories.length);

    // Update Category
    const updatedCat = await categoryService.updateCategory(testCategory.CategoryId, {
      CategoryName: 'Áo Nam Designer',
      Description: 'Danh mục áo thiết kế cao cấp cho nam'
    });
    console.log('✔ Update Category success. New Name:', updatedCat.CategoryName, '| New Slug:', updatedCat.Slug);

    // Get Full Category Tree
    const tree = await categoryService.getAllCategories({ tree: 'true' });
    const match = tree.find(c => c.CategoryId === testCategory.CategoryId);
    if (match) {
      console.log('✔ Get Categories Hierarchy Tree success. Found test category in tree.');
    }

    // ----------------------------------------------------
    // 2. PRODUCT CRUD TEST
    // ----------------------------------------------------
    console.log('\n--- Product Service Tests ---');

    // Create Product with Images & Variants (Transaction Safe)
    testProduct = await productService.createProduct({
      CategoryId: testSubCategory.CategoryId,
      ProductName: 'Áo khoác gió Urban Waterproof v1',
      Description: 'Áo chống thấm nước cao cấp',
      BasePrice: 450000.00,
      SalePrice: 399000.00,
      Gender: 'MALE',
      Status: 'ACTIVE',
      Images: [
        { ImageUrl: 'http://example.com/img1.jpg', IsPrimary: true, SortOrder: 0 },
        { ImageUrl: 'http://example.com/img2.jpg', IsPrimary: false, SortOrder: 1 }
      ],
      Variants: [
        {
          SizeId: testSize.SizeId,
          ColorId: testColor.ColorId,
          SKU: 'AK-URB-WAT-S-BLK-' + Date.now(),
          StockQuantity: 50,
          AdditionalPrice: 0.00,
          IsActive: true
        }
      ]
    });
    console.log('✔ Create Product with transaction success. ID:', testProduct.ProductId, '| Slug:', testProduct.Slug);
    console.log('  Images count:', testProduct.Images.length);
    console.log('  Variants count:', testProduct.Variants.length);

    // Get Product Detail by ID
    const fetchedProd = await productService.getProductById(testProduct.ProductId);
    console.log('✔ Get Product by ID success. Name:', fetchedProd.ProductName);
    console.log('  Category Name:', fetchedProd.Category?.CategoryName);
    console.log('  Primary Image Url:', fetchedProd.Images.find(i=>i.IsPrimary)?.ImageUrl);
    console.log('  Variant SKU:', fetchedProd.Variants[0]?.SKU);

    // Query Products with Paging/Filtering
    const listResult = await productService.getAllProducts({
      category: testSubCategory.CategoryId,
      gender: 'MALE',
      minPrice: 300000,
      maxPrice: 500000
    });
    console.log('✔ Get Products List with filters success. Total dynamic items found:', listResult.totalItems);

    // Update Product Details along with images & variants replacement
    const updatedProd = await productService.updateProduct(testProduct.ProductId, {
      ProductName: 'Áo khoác gió Urban Waterproof v1.1 Premium',
      BasePrice: 500000.00,
      SalePrice: 420000.00,
      Images: [
        { ImageUrl: 'http://example.com/img_updated_1.jpg', IsPrimary: true, SortOrder: 0 }
      ],
      Variants: [
        {
          SizeId: testSize.SizeId,
          ColorId: testColor.ColorId,
          SKU: 'AK-URB-WAT-S-BLK-UP-' + Date.now(),
          StockQuantity: 100,
          AdditionalPrice: 20000.00,
          IsActive: true
        }
      ]
    });
    console.log('✔ Update Product transactional success. New Name:', updatedProd.ProductName);
    console.log('  New Images count:', updatedProd.Images.length);
    console.log('  New Variants count:', updatedProd.Variants.length, '| SKU:', updatedProd.Variants[0]?.SKU);

    // ----------------------------------------------------
    // CLEANUP TEST DATA
    // ----------------------------------------------------
    console.log('\n--- Cleaning up Test Data ---');
    
    // Delete Product
    await productService.deleteProduct(testProduct.ProductId);
    console.log('✔ Delete Product success.');

    // Delete SubCategory
    await categoryService.deleteCategory(testSubCategory.CategoryId);
    console.log('✔ Delete SubCategory success.');

    // Delete Main Category
    await categoryService.deleteCategory(testCategory.CategoryId);
    console.log('✔ Delete Main Category success.');

    console.log('\n✔ All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ An error occurred during test execution:');
    console.error(error);

    // Attempt clean up of any created elements on fail
    try {
      if (testProduct) await productService.deleteProduct(testProduct.ProductId);
      if (testSubCategory) await categoryService.deleteCategory(testSubCategory.CategoryId);
      if (testCategory) await categoryService.deleteCategory(testCategory.CategoryId);
      console.log('Attempted cleanup of partial test files.');
    } catch {}
  } finally {
    await sequelize.close();
    console.log('=== CLOSED DATABASE CONNECTION ===');
  }
}

runTests();
