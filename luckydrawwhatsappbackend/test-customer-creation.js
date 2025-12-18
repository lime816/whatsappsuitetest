require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function testCustomerCreation() {
  try {
    console.log('🧪 Testing customer creation...');
    
    // Test data
    const testData = {
      name: 'Test User',
      phoneNumber: '+919876543210',
      dob: new Date(1990, 5, 15), // June 15, 1990
      gender: 'MALE'
    };

    // Create customer
    const query = `
      INSERT INTO customers (customer_name, phone_number, dob, gender)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      testData.name,
      testData.phoneNumber,
      testData.dob,
      testData.gender
    ]);

    console.log('✅ Customer created successfully:');
    console.log(result.rows[0]);

    // Clean up - delete the test customer
    await pool.query('DELETE FROM customers WHERE customer_name = $1', [testData.name]);
    console.log('✅ Test customer cleaned up');

  } catch (error) {
    console.error('❌ Error creating customer:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testCustomerCreation();