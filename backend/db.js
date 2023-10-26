const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'badmaking',
  password: 'Gribe123!',
  port: 5432, 
});

module.exports = pool;
