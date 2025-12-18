// Test if .env file is being loaded correctly
require('dotenv').config();

console.log('\n🔍 Testing Environment Variables:\n');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not Set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not Set');
console.log('\nValues:');
console.log('SUPABASE_URL =', process.env.SUPABASE_URL || 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY =', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'MISSING');
console.log('\n');
