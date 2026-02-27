import express from 'express';

const router = express.Router();

// Mock Data
const mockUsageData = [
  { date: '2026-10-01', tool: 'ChatGPT', hours: 2 },
  { date: '2026-10-02', tool: 'GitHub Copilot', hours: 4 },
  { date: '2026-10-03', tool: 'Claude', hours: 1 },
  { date: '2026-10-04', tool: 'ChatGPT', hours: 3 },
  { date: '2026-10-05', tool: 'GitHub Copilot', hours: 5 },
];

const mockGuidelines = [
  { id: 1, title: 'Transparency', description: 'Always declare AI usage in assignments.' },
  { id: 2, title: 'Privacy', description: 'Do not input sensitive or private data into public AI models.' },
  { id: 3, title: 'Originality', description: 'Use AI to support learning, not to replace original thought.' }
];

const mockResources = [
  { id: 1, title: 'Effective Prompting Techniques', type: 'video', url: '#' },
  { id: 2, title: 'Understanding Bias in AI', type: 'article', url: '#' },
  { id: 3, title: 'University Policies on GenAI', type: 'document', url: '#' }
];

const mockQuiz = {
  questions: [
    { question: 'Should you declare AI usage on your assignment?', expectedAnswer: 'Yes' },
    { question: 'Is it ethical to copy-paste AI responses directly without reading?', expectedAnswer: 'No' },
  ]
};

// API routes
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if(username && password) {
    res.json({ token: 'mock-jwt-token', user: { username } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/usage', (req, res) => {
  res.json(mockUsageData);
});

router.get('/guidelines', (req, res) => {
  res.json(mockGuidelines);
});

router.get('/resources', (req, res) => {
  res.json({ resources: mockResources, quiz: mockQuiz });
});

router.get('/feedback', (req, res) => {
  res.json({ feedback: 'You have been using GitHub Copilot extensively this week. Make sure you fully understand the code it generates.' });
});

export default router;
