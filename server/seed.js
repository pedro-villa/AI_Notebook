/**
 * seed.js — Run with: npm run seed
 *
 *   - 2 mock users (alice & bob) with hashed passwords
 *   - Ethical guidelines
 *   - Educational resources with embedded quiz questions
 *   - 60 days of UsageEntry records linked to each user
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import UsageEntry from './models/UsageEntry.js';
import Guideline from './models/Guideline.js';
import Resource from './models/Resource.js';

// ------------------------------------------------------------------ helpers
const randomBetween = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 10) / 10;

const tools = ['ChatGPT', 'GitHub Copilot', 'Claude'];
const seedTasks = [
  'Brainstorm assignment outline',
  'Draft code documentation',
  'Review and refactor function',
  'Summarize research article',
  'Generate test case ideas',
  'Explain algorithm complexity',
];

const seedOutputs = [
  'Received structured suggestions and selected the most relevant parts.',
  'Generated a first draft that was manually reviewed and edited before submission.',
  'Got debugging hints and validated each proposed fix against project requirements.',
  'Produced a concise summary and cross-checked key claims with trusted sources.',
  'Created candidate test scenarios and adapted them to the final implementation.',
  'Obtained explanation examples and rewrote them in my own wording.',
];

function buildUsageFor(userId, days = 30) {
  const entries = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Each day gets 1–3 tool entries so the graph has visible variation
    const numEntries = Math.ceil(Math.random() * 3);
    const usedTools = [...tools].sort(() => Math.random() - 0.5).slice(0, numEntries);

    for (const tool of usedTools) {
      const task = seedTasks[Math.floor(Math.random() * seedTasks.length)];
      const aiOutput = seedOutputs[Math.floor(Math.random() * seedOutputs.length)];
      entries.push({ userId, date, tool, hours: randomBetween(0.5, 5), task, aiOutput });
    }
  }
  return entries;
}

// --------------------------------------------------------------- seed data
const guidelineData = [
  { order: 1, category: 'Transparency',  title: 'Declare AI Usage',    description: 'Always disclose AI assistance in your submissions according to NTNU policy.' },
  { order: 2, category: 'Privacy',       title: 'Protect Privacy',     description: 'Never submit personal, sensitive, or confidential data to public AI models.' },
  { order: 3, category: 'Integrity',     title: 'Maintain Originality', description: 'Use AI to support your thinking, not to replace it. Your conclusions must be your own.' },
  { order: 4, category: 'Verification',  title: 'Verify AI Outputs',   description: 'AI systems can hallucinate. Cross-check every factual claim against authoritative sources.' },
  { order: 5, category: 'Attribution',   title: 'Cite AI Tools',       description: 'Treat AI-generated content like any other source and provide appropriate attribution.' },
  { order: 6, category: 'Security',      title: 'Maintain Code Security', description: 'Do not upload proprietary code, API keys, or sensitive student records to cloud AI providers.' },
  { order: 7, category: 'Awareness',     title: 'Recognise AI Bias',   description: 'Understand that LLMs reflect biases present in their training data. Always review with critical reasoning.' },
];

const resourceData = [
  {
    title: 'Effective Prompting Techniques',
    type: 'video',
    url: 'https://example.com/prompting-techniques',
    quizQuestions: [
      { question: 'Should you provide context when writing a prompt?', expectedAnswer: 'Yes' },
      { question: 'Can AI-generated prompts replace original analysis?', expectedAnswer: 'No' },
    ],
  },
  {
    title: 'Understanding Bias in AI Systems',
    type: 'article',
    url: 'https://example.com/ai-bias',
    quizQuestions: [
      { question: 'Can AI models inherit bias from training data?', expectedAnswer: 'Yes' },
      { question: 'Is an AI output always neutral and unbiased?', expectedAnswer: 'No' },
    ],
  },
  {
    title: 'NTNU Guidelines on Generative AI',
    type: 'document',
    url: 'https://example.com/ntnu-ai-guidelines',
    quizQuestions: [
      { question: 'Must you declare AI usage in your assignments according to NTNU rules?', expectedAnswer: 'Yes' },
      { question: 'Is submitting AI-generated text as your own work acceptable?', expectedAnswer: 'No' },
    ],
  },
  {
    title: 'Code Plagiarism and GitHub Copilot',
    type: 'article',
    url: 'https://example.com/copilot-plagiarism',
    quizQuestions: [
      { question: 'Can GitHub Copilot suggest code identical to publicly licensed code?', expectedAnswer: 'Yes' },
      { question: 'Are you exempt from copyright compliance when an AI writes the code?', expectedAnswer: 'No' },
    ],
  },
];

// ---------------------------------------------------------------- main run
async function seed() {
  console.log('🔗 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.\n');

  // ----- Clear collections -----
  console.log('🗑  Clearing existing data…');
  await Promise.all([
    User.deleteMany({}),
    UsageEntry.deleteMany({}),
    Guideline.deleteMany({}),
    Resource.deleteMany({}),
  ]);

  // ----- Create guidelines -----
  console.log('📋 Seeding guidelines…');
  await Guideline.insertMany(guidelineData);

  // ----- Create resources -----
  console.log('📚 Seeding resources…');
  await Resource.insertMany(resourceData);

  // ----- Create users -----
  console.log('👥 Seeding users…');
  const salt = await bcrypt.genSalt(10);

  const aliceHash = await bcrypt.hash('password123', salt);
  const bobHash   = await bcrypt.hash('password123', salt);

  const alice = await User.create({
    username: 'alice',
    email: 'alice@student.ntnu.no',
    passwordHash: aliceHash,
    role: 'student',
  });

  const bob = await User.create({
    username: 'bob',
    email: 'bob@student.ntnu.no',
    passwordHash: bobHash,
    role: 'student',
  });

  // ----- Create usage entries -----
  console.log('📊 Seeding usage entries (60 days × 2 users)…');
  const aliceEntries = buildUsageFor(alice._id, 60);
  const bobEntries   = buildUsageFor(bob._id, 60);
  await UsageEntry.insertMany([...aliceEntries, ...bobEntries]);

  console.log(`\n✅ Seed complete!`);
  console.log(`   Users created:        alice / bob  (password: password123 for both)`);
  console.log(`   Guidelines seeded:    ${guidelineData.length}`);
  console.log(`   Resources seeded:     ${resourceData.length}`);
  console.log(`   Usage entries seeded: ${aliceEntries.length + bobEntries.length}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
