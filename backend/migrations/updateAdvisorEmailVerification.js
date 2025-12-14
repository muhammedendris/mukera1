const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

/**
 * Migration script to update existing advisor accounts
 * Sets isEmailVerified = true for all advisors
 *
 * Advisors created by Admin should be auto-verified and not require email verification
 */
async function updateAdvisors() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ADVISOR EMAIL VERIFICATION MIGRATION ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    console.log('🔌 Connecting to database...');
    console.log('   MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    console.log('🔍 Finding advisors with isEmailVerified = false...');
    const advisorsToUpdate = await User.find({
      role: 'advisor',
      isEmailVerified: false
    }).select('email fullName role isEmailVerified');

    console.log(`   Found ${advisorsToUpdate.length} advisor(s) to update:`);
    advisorsToUpdate.forEach((advisor, index) => {
      console.log(`   ${index + 1}. ${advisor.email} - ${advisor.fullName}`);
    });

    if (advisorsToUpdate.length === 0) {
      console.log('\n✅ No advisors need updating. All advisors are already email verified!');
      await mongoose.connection.close();
      console.log('🔌 Database connection closed\n');
      process.exit(0);
      return;
    }

    console.log('\n⚙️  Updating advisors...');
    const result = await User.updateMany(
      { role: 'advisor', isEmailVerified: false },
      { $set: { isEmailVerified: true } }
    );

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      MIGRATION COMPLETED SUCCESSFULLY  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`✅ Updated ${result.modifiedCount} advisor account(s)`);
    console.log('   All advisors can now log in without email verification\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║       MIGRATION ERROR OCCURRED         ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('\n');

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed\n');
    }

    process.exit(1);
  }
}

// Run the migration
updateAdvisors();
