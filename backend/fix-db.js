require('dotenv').config();
const { sequelize } = require('./models');

async function fix() {
  try {
    await sequelize.query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'UsageLimitPerUser' AND Object_ID = Object_ID(N'dbo.Coupons'))
      BEGIN
          ALTER TABLE dbo.Coupons ADD UsageLimitPerUser INT NULL;
      END
    `);
    
    await sequelize.query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'ApplyTo' AND Object_ID = Object_ID(N'dbo.Coupons'))
      BEGIN
          ALTER TABLE dbo.Coupons ADD ApplyTo VARCHAR(50) NOT NULL CONSTRAINT DF_Coupons_ApplyTo DEFAULT 'ALL';
      END
    `);
    
    console.log('Columns added successfully');
  } catch (err) {
    console.error('Error adding columns', err);
  } finally {
    await sequelize.close();
  }
}
fix();
