const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mssql',
    logging: console.log,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  }
);

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Create Coupons table
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Coupons]') AND type in (N'U'))
      BEGIN
        CREATE TABLE Coupons
        (
            CouponId BIGINT IDENTITY(1,1) PRIMARY KEY,
            Code VARCHAR(50) NOT NULL UNIQUE,       
            Name NVARCHAR(100) NOT NULL,            
            Description NVARCHAR(500) NULL,         

            DiscountType VARCHAR(20) NOT NULL       
                CONSTRAINT DF_Coupons_Type DEFAULT 'FIXED_AMOUNT', 

            DiscountValue DECIMAL(18,2) NOT NULL,   
            
            MinOrderValue DECIMAL(18,2) NOT NULL    
                CONSTRAINT DF_Coupons_MinOrder DEFAULT 0,
                
            MaxDiscountAmount DECIMAL(18,2) NULL,   

            UsageLimit INT NULL,                    
            UsedCount INT NOT NULL                  
                CONSTRAINT DF_Coupons_UsedCount DEFAULT 0,
                
            UsageLimitPerUser INT NULL,             
            
            ApplyTo VARCHAR(50) NOT NULL            
                CONSTRAINT DF_Coupons_ApplyTo DEFAULT 'ALL',

            StartDate DATETIME2 NOT NULL            
                CONSTRAINT DF_Coupons_StartDate DEFAULT SYSDATETIME(),
            EndDate DATETIME2 NULL,                 

            IsActive BIT NOT NULL                   
                CONSTRAINT DF_Coupons_IsActive DEFAULT 1,

            CreatedAt DATETIME2 NOT NULL
                CONSTRAINT DF_Coupons_CreatedAt DEFAULT SYSDATETIME(),

            CONSTRAINT CK_Coupons_DiscountType
                CHECK (DiscountType IN ('FIXED_AMOUNT', 'PERCENTAGE')),

            CONSTRAINT CK_Coupons_DiscountValue
                CHECK (DiscountValue > 0),

            CONSTRAINT CK_Coupons_Dates
                CHECK (EndDate IS NULL OR EndDate >= StartDate),
                
            CONSTRAINT CK_Coupons_Usage
                CHECK (UsageLimit IS NULL OR UsedCount <= UsageLimit),
                
            CONSTRAINT CK_Coupons_ApplyTo
                CHECK (ApplyTo IN ('ALL', 'CATEGORY', 'PRODUCT'))
        );
      END
    `);

    // 2. Add CouponId to Orders
    await sequelize.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'CouponId'
      )
      BEGIN
        ALTER TABLE Orders ADD CouponId BIGINT NULL;
        ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Coupons FOREIGN KEY (CouponId) REFERENCES Coupons(CouponId) ON DELETE SET NULL;
      END
    `);

    // 3. Create CouponCategories table
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CouponCategories]') AND type in (N'U'))
      BEGIN
        CREATE TABLE CouponCategories
        (
            CouponId BIGINT NOT NULL,
            CategoryId INT NOT NULL,
            PRIMARY KEY (CouponId, CategoryId),
            CONSTRAINT FK_CouponCategories_Coupons FOREIGN KEY (CouponId) REFERENCES Coupons(CouponId) ON DELETE CASCADE,
            CONSTRAINT FK_CouponCategories_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId) ON DELETE CASCADE
        );
      END
    `);

    // 4. Create CouponProducts table
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CouponProducts]') AND type in (N'U'))
      BEGIN
        CREATE TABLE CouponProducts
        (
            CouponId BIGINT NOT NULL,
            ProductId BIGINT NOT NULL,
            PRIMARY KEY (CouponId, ProductId),
            CONSTRAINT FK_CouponProducts_Coupons FOREIGN KEY (CouponId) REFERENCES Coupons(CouponId) ON DELETE CASCADE,
            CONSTRAINT FK_CouponProducts_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE
        );
      END
    `);

    console.log('Database updated successfully.');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await sequelize.close();
  }
}

run();
