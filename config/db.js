const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql-709611-crm-system.h.aivencloud.com',
  port: 15357,
  user: 'avnadmin',
  password: 'AVNS_t6G2cG7_48upBUS6at8',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = connection;
