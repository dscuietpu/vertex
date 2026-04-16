require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');

// Sample civic issue descriptions
const descriptions = [
  'Large pothole on asphalt road causing traffic hazard',
  'Overflowing garbage bin near residential street',
  'Broken streetlight leaving pedestrian area in darkness',
  'Open drain cover on busy sidewalk posing safety risk',
  'Water leakage from underground pipe flooding footpath',
  'Road damage from heavy vehicles creating dangerous driving conditions',
  'Illegal garbage dumping on public park grounds',
  'Damaged streetlight at major intersection causing visibility issues',
  'Deep pothole near school zone causing vehicle damage',
  'Sewage overflow on residential road creating health hazard',
  'Cracked pavement on main road with exposed rebar',
  'Overgrown vegetation blocking traffic signal visibility',
  'Debris and litter accumulation near market area',
  'Open electrical wire hanging low over public walkway',
  'Clogged storm drain causing street flooding after rain',
  'Vandalized public bench in city park',
  'Broken guardrail on bridge approach posing accident risk',
  'Street sign knocked down at junction creating confusion',
  'Accumulated silt blocking drainage channel near school',
  'Faded road markings at pedestrian crossing creating safety issue',
];

// Center coordinates (example: Mumbai, India) - adjust as needed
const BASE_LAT = 19.076;
const BASE_LON = 72.877;

function randomOffset(range = 0.05) {
  return (Math.random() - 0.5) * range;
}

function classifyPriority(description) {
  const desc = description.toLowerCase();
  const highKeywords = ['pothole', 'water leakage', 'open drain', 'road damage', 'sewage', 'electrical', 'hazard', 'flood', 'broken pipe'];
  const medKeywords = ['garbage', 'streetlight', 'litter', 'debris', 'crack', 'vandalized', 'blocked', 'clogged'];

  for (const kw of highKeywords) if (desc.includes(kw)) return 'High';
  for (const kw of medKeywords) if (desc.includes(kw)) return 'Medium';
  return 'Low';
}

const statuses = ['Pending', 'In Progress', 'Resolved'];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civicai');
    console.log('✅ MongoDB connected');

    // Clear existing issues
    await Issue.deleteMany({});
    console.log('🗑️  Cleared existing issues');

    const issues = descriptions.map((description, index) => ({
      imageUrl: `/uploads/sample-${index + 1}.jpg`,
      description,
      latitude: BASE_LAT + randomOffset(),
      longitude: BASE_LON + randomOffset(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: classifyPriority(description),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
    }));

    const inserted = await Issue.insertMany(issues);
    console.log(`✅ Inserted ${inserted.length} sample issues`);

    inserted.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.priority}] ${issue.description.substring(0, 50)}...`);
    });

    await mongoose.disconnect();
    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
