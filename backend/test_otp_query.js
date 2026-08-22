import { queryGet } from './database/db.js';

async function testOtpQuery() {
  try {
    const expiredAt = new Date(Date.now() - 60000); // 1 minute ago
    const result = await queryGet(
      'SELECT CASE WHEN NOW() > ? THEN 1 ELSE 0 END as isExpired',
      [expiredAt]
    );
    console.log('OTP query result:', result);
    if (result && result.isExpired === 1) {
      console.log('✅ OTP query test passed successfully!');
      process.exit(0);
    } else {
      console.error('❌ OTP query test returned unexpected result:', result);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ OTP query test failed with error:', err.message);
    process.exit(1);
  }
}

testOtpQuery();
