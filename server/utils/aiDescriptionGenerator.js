const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// FREE AI Description Generator
//
// Strategy (tries in order):
//   1. Groq API (LLaMA 3.2 Vision) — free, fast, 14400 req/day
//   2. Smart Mock Mode             — works with zero API keys, great for demos
//
// HOW TO GET A FREE GROQ KEY (no credit card needed):
//   1. Go to https://console.groq.com → Sign up free
//   2. Go to API Keys → Create API Key
//   3. Copy it into your .env as GROQ_API_KEY
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock description bank (realistic civic issue descriptions) ────────────────
const MOCK_DESCRIPTIONS = [
  'Large pothole on asphalt road causing traffic hazard near intersection',
  'Overflowing garbage bin near residential street attracting pests',
  'Broken streetlight leaving pedestrian area in complete darkness',
  'Open drain cover on busy sidewalk posing serious safety risk to pedestrians',
  'Water leakage from underground pipe flooding the footpath',
  'Road damage from heavy vehicles creating dangerous driving conditions',
  'Cracked pavement on main road with exposed rebar creating tripping hazard',
  'Sewage overflow on residential road creating major health hazard',
  'Clogged storm drain causing street flooding after heavy rainfall',
  'Damaged guardrail on bridge approach posing serious accident risk',
  'Overgrown vegetation blocking traffic signal visibility at junction',
  'Accumulated debris and litter near public market area',
  'Broken public bench in city park requiring urgent repair',
  'Faded road markings at pedestrian crossing creating safety issues',
  'Illegal garbage dumping on public park grounds',
  'Street sign knocked down at major junction causing confusion',
  'Deep pothole near school zone causing vehicle damage and safety risk',
  'Exposed electrical wire hanging low over public walkway',
  'Vandalized public property near commercial area',
  'Collapsed road shoulder creating dangerous drop-off for vehicles',
];

// ── Keyword map: picks contextually fitting desc from filename hints ───────────
const KEYWORD_MAP = [
  { keywords: ['pothole', 'hole', 'road', 'asphalt', 'crack'], index: 0 },
  { keywords: ['garbage', 'trash', 'bin', 'waste', 'litter', 'dump'], index: 1 },
  { keywords: ['light', 'lamp', 'street', 'dark', 'bulb'], index: 2 },
  { keywords: ['drain', 'gutter', 'sewer', 'manhole'], index: 3 },
  { keywords: ['water', 'leak', 'flood', 'pipe', 'wet'], index: 4 },
  { keywords: ['damage', 'broken', 'road', 'vehicle'], index: 5 },
  { keywords: ['pavement', 'sidewalk', 'footpath', 'walkway'], index: 6 },
  { keywords: ['sewage', 'overflow', 'smell'], index: 7 },
  { keywords: ['clog', 'blocked', 'storm'], index: 8 },
  { keywords: ['guardrail', 'barrier', 'bridge'], index: 9 },
  { keywords: ['tree', 'vegetation', 'bush', 'overgrown', 'signal'], index: 10 },
  { keywords: ['debris', 'market'], index: 11 },
  { keywords: ['bench', 'park', 'furniture'], index: 12 },
  { keywords: ['marking', 'zebra', 'crossing', 'faded'], index: 13 },
  { keywords: ['electric', 'wire', 'cable', 'power'], index: 17 },
];

/**
 * mockDescriptionFromFilename
 * Picks a contextually fitting description based on the image filename.
 */
function mockDescriptionFromFilename(imagePath) {
  const filename = path.basename(imagePath).toLowerCase();
  for (const { keywords, index } of KEYWORD_MAP) {
    if (keywords.some((kw) => filename.includes(kw))) {
      return MOCK_DESCRIPTIONS[index];
    }
  }
  // Random pick if no keyword match — still realistic
  return MOCK_DESCRIPTIONS[Math.floor(Math.random() * MOCK_DESCRIPTIONS.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq Free Inference API (LLaMA 3.2 Vision)
//
// Free tier: 14400 requests / day, 7000 tokens / minute
// Models: meta-llama/llama-4-scout-17b-16e-instruct (vision capable)
// ─────────────────────────────────────────────────────────────────────────────
async function generateWithGroq(imagePath) {
  const token = process.env.GROQ_API_KEY;
  if (!token) throw new Error('No Groq token configured');

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Determine MIME type from extension
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: 'Describe this civic infrastructure issue or public problem visible in the image in one concise sentence (max 20 words). Focus on: damage type, location type, and safety impact. Do not start with "I" or "This image shows". Just state the issue directly.',
            },
          ],
        },
      ],
      max_tokens: 80,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API ${response.status}: ${text}`);
  }

  const result = await response.json();
  const caption = result.choices?.[0]?.message?.content?.trim() || '';
  return caption || MOCK_DESCRIPTIONS[Math.floor(Math.random() * MOCK_DESCRIPTIONS.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — tries Groq first, falls back to smart mock
// ─────────────────────────────────────────────────────────────────────────────
async function generateDescription(imagePath) {
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('🤖 Calling Groq (LLaMA 4 Vision — free)...');
      const description = await generateWithGroq(imagePath);
      console.log(`✅ Groq: "${description}"`);
      return description;
    } catch (err) {
      console.warn(`⚠️  Groq failed: ${err.message} — switching to smart mock`);
    }
  }

  // Zero-API-key fallback — fully functional for demos
  console.log('🎭 Smart mock AI active (no API key needed)');
  const description = mockDescriptionFromFilename(imagePath);
  console.log(`📝 Mock: "${description}"`);
  return description;
}

module.exports = { generateDescription };
