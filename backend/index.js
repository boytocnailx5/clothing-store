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

// Helper to ensure ProductImages table has ColorName & ColorId columns
const ensureProductImagesColumns = async () => {
  try {
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
  } catch (err) {
    console.warn('Notice when ensuring ProductImages columns:', err.message);
  }
};

// Sync Database and Start Server
sequelize.authenticate()
  .then(async () => {
    console.log('Connection to the database has been established successfully.');
    await ensureProductImagesColumns();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
