require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const email = 'vertex@civicai.gov';
    const password = '123456789';
    
    let user = await User.findOne({ email });
    
    if (user) {
      console.log(`User ${email} already exists, updating to GOV role and resetting password...`);
      user.password = await bcrypt.hash(password, 10);
      user.role = 'GOV';
      await user.save();
    } else {
      console.log(`Creating new admin user: ${email}...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name: 'Vertex Admin',
        email,
        password: hashedPassword,
        role: 'GOV',
        citizenId: null
      });
      await user.save();
    }
    
    console.log('Admin user seeded successfully! You can now login.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
