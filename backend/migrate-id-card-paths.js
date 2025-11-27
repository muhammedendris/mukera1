const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// User model schema (simplified for migration)
const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  fullName: String,
  idCardPath: String,
  isVerified: Boolean
});

const User = mongoose.model('User', userSchema);

// Migration function
async function migrateIdCardPaths() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully!\n');

    // Find all users with idCardPath
    const users = await User.find({
      idCardPath: { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`Found ${users.length} users with ID card paths\n`);

    if (users.length === 0) {
      console.log('No users to migrate. Exiting...');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const currentPath = user.idCardPath;

      // Check if the path is already in the correct format (starts with /uploads/)
      if (currentPath.startsWith('/uploads/')) {
        console.log(`✓ SKIPPED: ${user.fullName} (${user.email}) - Already in correct format`);
        skippedCount++;
        continue;
      }

      // Extract filename from the absolute path
      // Handle both Windows and Unix paths
      const filename = path.basename(currentPath);

      // Determine the subfolder based on the path or set default
      let newPath;
      if (currentPath.includes('id-cards') || currentPath.includes('id-card-')) {
        newPath = `/uploads/id-cards/${filename}`;
      } else if (currentPath.includes('reports') || currentPath.includes('report-')) {
        newPath = `/uploads/reports/${filename}`;
      } else {
        // Default to id-cards if we can't determine
        newPath = `/uploads/id-cards/${filename}`;
      }

      // Update the user's idCardPath
      user.idCardPath = newPath;
      await user.save();

      console.log(`✓ UPDATED: ${user.fullName} (${user.email})`);
      console.log(`  Old: ${currentPath}`);
      console.log(`  New: ${newPath}\n`);

      updatedCount++;
    }

    // Summary
    console.log('========================================');
    console.log('MIGRATION SUMMARY');
    console.log('========================================');
    console.log(`Total users found: ${users.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already correct): ${skippedCount}`);
    console.log('========================================\n');

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the migration
console.log('========================================');
console.log('ID Card Path Migration Script');
console.log('========================================\n');

migrateIdCardPaths();
