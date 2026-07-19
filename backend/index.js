const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Welcome to the Clothing Store Backend API!');
});

// Sync Database and Start Server
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
    // Có thể dùng sequelize.sync() để auto tạo bảng, nhưng do đã có sẵn OJT.sql nên không cần.
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
