/**
 * Seed script — creates the GOV authority account for "Vertex"
 * Run with:  node server/scripts/seedAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

const ADMIN = {
  name:     'Vertex Authority',
  email:    'vertex@civicai.gov',
  password: '123456789',
  role:     'GOV',
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civicai');
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    // Update password in case it changed
    existing.password = await bcrypt.hash(ADMIN.password, 10);
    existing.role     = 'GOV';
    existing.name     = ADMIN.name;
    await existing.save();
    console.log('🔄 Authority account updated:', ADMIN.email);
  } else {
    const hashed = await bcrypt.hash(ADMIN.password, 10);
    await User.create({
      name:     ADMIN.name,
      email:    ADMIN.email,
      password: hashed,
      role:     'GOV',
    });
    console.log('🎉 Authority account created:', ADMIN.email);
  }

  console.log('\n─────────────────────────────────────');
  console.log('  Authority Login Credentials');
  console.log('─────────────────────────────────────');
  console.log('  Authority ID :', ADMIN.email);
  console.log('  Password     :', ADMIN.password);
  console.log('  Role         :', 'GOV');
  console.log('─────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
