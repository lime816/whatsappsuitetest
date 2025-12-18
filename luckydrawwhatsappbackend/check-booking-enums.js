require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkTables() {
  try {
    console.log('📋 Billing table structure:');
    const billingQuery = 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'billing\' ORDER BY ordinal_position';
    const billingResult = await pool.query(billingQuery);
    billingResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();