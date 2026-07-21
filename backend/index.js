const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const path = require('path');

// Routes
app.use('/api', routes);

// Phục vụ các file tĩnh (ảnh đã upload)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to the Clothing Store Backend API!');
});

// Helper to ensure extra columns and tables exist safely in MSSQL
const ensureDatabaseSchema = async () => {
  try {
    // 1. Ensure ProductImages columns
    await sequelize.query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ProductImages' AND COLUMN_NAME = 'ColorName'
      )
      BEGIN
        ALTER TABLE [ProductImages] ADD [ColorName] NVARCHAR(50) NULL;
      END
    `);
    await sequelize.query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ProductImages' AND COLUMN_NAME = 'ColorId'
      )
      BEGIN
        ALTER TABLE [ProductImages] ADD [ColorId] INT NULL;
      END
    `);

    // 2. Ensure InventoryLogs Table
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

    // 3. Ensure OrderItems Table
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
      BEGIN
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
      END
    `);

    console.log('✔ Database schema verified and updated safely');
  } catch (err) {
    console.warn('Notice when ensuring DB schema:', err.message);
  }
};

// Sync Database and Start Server
sequelize.authenticate()
  .then(async () => {
    console.log('Connection to the database has been established successfully.');
    await ensureDatabaseSchema();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
