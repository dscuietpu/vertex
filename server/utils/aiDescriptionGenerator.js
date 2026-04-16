const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// AI Analysis Generator  (description + classification in one call)
//
// Strategy:
//   1. Groq API  — LLaMA 4 Scout Vision (free, 14 400 req/day)
//      Returns JSON: { description, priority, category }
//   2. Smart mock — keyword-based fallback, zero API keys needed
//
// Valid priority values : "High" | "Medium" | "Low"
// Valid category values : "Road & Traffic" | "Water & Drainage" |
//                         "Electricity" | "Sanitation" | "Public Property" |
//                         "Other"
// ─────────────────────────────────────────────────────────────────────────────

const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_CATEGORIES = [
  'Road & Traffic',
  'Water & Drainage',
  'Electricity',
  'Sanitation',
  'Public Property',
  'Other',
];

// ── Structured prompt sent to LLaMA 4 ────────────────────────────────────────
const SYSTEM_PROMPT = `You are a civic infrastructure analyst for a government grievance portal.
Analyse the image and respond ONLY with a valid JSON object — no markdown, no explanation.

Schema:
{
  "description": "<one concise sentence, max 20 words, stating the issue, location type, and safety impact>",
  "priority": "<exactly one of: High | Medium | Low>",
  "category": "<exactly one of: Road & Traffic | Water & Drainage | Electricity | Sanitation | Public Property | Other>"
}

Priority rules:
- High   → immediate danger (pothole, collapsed road, sewage overflow, exposed wire, flood, gas leak, sinkhole)
- Medium → public nuisance (broken streetlight, garbage overflow, cracked pavement, graffiti, blocked drain)
- Low    → minor / cosmetic (faded markings, overgrown grass, broken bench, litter)`;

// ── Mock bank — realistic fallback data ───────────────────────────────────────
const MOCK_BANK = [
  { description: 'Large pothole on asphalt road causing traffic hazard near intersection',     priority: 'High',   category: 'Road & Traffic'   },
  { description: 'Overflowing garbage bin near residential street attracting pests',           priority: 'Medium', category: 'Sanitation'        },
  { description: 'Broken streetlight leaving pedestrian area in complete darkness',            priority: 'Medium', category: 'Electricity'       },
  { description: 'Open drain cover on busy sidewalk posing serious safety risk',               priority: 'High',   category: 'Water & Drainage'  },
  { description: 'Water leakage from underground pipe flooding the footpath',                  priority: 'High',   category: 'Water & Drainage'  },
  { description: 'Road damage from heavy vehicles creating dangerous driving conditions',      priority: 'High',   category: 'Road & Traffic'   },
  { description: 'Cracked pavement on main road with exposed rebar creating tripping hazard', priority: 'Medium', category: 'Road & Traffic'   },
  { description: 'Sewage overflow on residential road creating major health hazard',           priority: 'High',   category: 'Water & Drainage'  },
  { description: 'Clogged storm drain causing street flooding after heavy rainfall',           priority: 'High',   category: 'Water & Drainage'  },
  { description: 'Damaged guardrail on bridge approach posing serious accident risk',          priority: 'High',   category: 'Road & Traffic'   },
  { description: 'Overgrown vegetation blocking traffic signal visibility at junction',        priority: 'Medium', category: 'Public Property'   },
  { description: 'Accumulated debris and litter near public market area',                      priority: 'Low',    category: 'Sanitation'        },
  { description: 'Broken public bench in city park requiring urgent repair',                   priority: 'Low',    category: 'Public Property'   },
  { description: 'Faded road markings at pedestrian crossing creating safety issues',          priority: 'Low',    category: 'Road & Traffic'   },
  { description: 'Illegal garbage dumping on public park grounds',                             priority: 'Medium', category: 'Sanitation'        },
  { description: 'Street sign knocked down at major junction causing confusion',               priority: 'Medium', category: 'Road & Traffic'   },
  { description: 'Deep pothole near school zone causing vehicle damage and safety risk',       priority: 'High',   category: 'Road & Traffic'   },
  { description: 'Exposed electrical wire hanging low over public walkway',                    priority: 'High',   category: 'Electricity'       },
  { description: 'Vandalized public property near commercial area causing safety concern',     priority: 'Medium', category: 'Public Property'   },
  { description: 'Collapsed road shoulder creating dangerous drop-off for vehicles',           priority: 'High',   category: 'Road & Traffic'   },
];

// Keyword → mock index map (for smart filename-based mock selection)
const KEYWORD_MAP = [
  { keywords: ['pothole', 'hole', 'road', 'asphalt', 'crack'],           index: 0  },
  { keywords: ['garbage', 'trash', 'bin', 'waste', 'litter', 'dump'],    index: 1  },
  { keywords: ['light', 'lamp', 'dark', 'bulb'],                          index: 2  },
  { keywords: ['drain', 'gutter', 'sewer', 'manhole'],                    index: 3  },
  { keywords: ['water', 'leak', 'flood', 'pipe', 'wet'],                  index: 4  },
  { keywords: ['damage', 'broken', 'vehicle'],                             index: 5  },
  { keywords: ['pavement', 'sidewalk', 'footpath', 'walkway'],            index: 6  },
  { keywords: ['sewage', 'overflow', 'smell'],                             index: 7  },
  { keywords: ['clog', 'blocked', 'storm'],                               index: 8  },
  { keywords: ['guardrail', 'barrier', 'bridge'],                          index: 9  },
  { keywords: ['tree', 'vegetation', 'bush', 'overgrown', 'signal'],      index: 10 },
  { keywords: ['debris', 'market'],                                        index: 11 },
  { keywords: ['bench', 'park', 'furniture'],                              index: 12 },
  { keywords: ['marking', 'zebra', 'crossing', 'faded'],                  index: 13 },
  { keywords: ['electric', 'wire', 'cable', 'power'],                     index: 17 },
];

function mockFromFilename(imagePath) {
  const filename = path.basename(imagePath).toLowerCase();
  for (const { keywords, index } of KEYWORD_MAP) {
    if (keywords.some((kw) => filename.includes(kw))) return MOCK_BANK[index];
  }
  return MOCK_BANK[Math.floor(Math.random() * MOCK_BANK.length)];
}

// ── Validate & sanitise AI JSON response ────────────────────────────────────
function validateAndFix(parsed) {
  const description = typeof parsed.description === 'string' && parsed.description.trim()
    ? parsed.description.trim()
    : null;

  const priority = VALID_PRIORITIES.includes(parsed.priority)
    ? parsed.priority
    : 'Low';

  const category = VALID_CATEGORIES.includes(parsed.category)
    ? parsed.category
    : 'Other';

  return { description, priority, category };
}

// ── Groq inference call ──────────────────────────────────────────────────────
async function analyseWithGroq(imagePath) {
  const token = process.env.GROQ_API_KEY;
  if (!token) throw new Error('No Groq API key configured');

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
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
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: SYSTEM_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API ${response.status}: ${text}`);
  }

  const result = await response.json();
  const raw = result.choices?.[0]?.message?.content?.trim() || '{}';

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Groq returned non-JSON: ${raw}`);
  }

  const { description, priority, category } = validateAndFix(parsed);

  if (!description) throw new Error('Groq returned empty description');

  return { description, priority, category };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// Returns: { description: string, priority: string, category: string }
// ─────────────────────────────────────────────────────────────────────────────
async function analyseImage(imagePath) {
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('🤖 Groq Vision (LLaMA 4 Scout) — analysing image...');
      const result = await analyseWithGroq(imagePath);
      console.log(`✅ AI result → priority: ${result.priority} | category: ${result.category}`);
      console.log(`📝 Description: "${result.description}"`);
      return result;
    } catch (err) {
      console.warn(`⚠️  Groq failed: ${err.message} — falling back to smart mock`);
    }
  }

  console.log('🎭 Smart mock AI active (no API key needed)');
  const mock = mockFromFilename(imagePath);
  console.log(`📝 Mock → priority: ${mock.priority} | category: ${mock.category}`);
  console.log(`📝 Mock description: "${mock.description}"`);
  return mock;
}

// Keep backward-compat alias used by older code paths
async function generateDescription(imagePath) {
  const { description } = await analyseImage(imagePath);
  return description;
}

module.exports = { analyseImage, generateDescription };
