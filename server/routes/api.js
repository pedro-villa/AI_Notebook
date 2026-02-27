import express from 'express';
import authMiddleware from '../middleware/auth.js';
import UsageEntry from '../models/UsageEntry.js';
import Guideline from '../models/Guideline.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

const router = express.Router();

// All routes below require a valid JWT
router.use(authMiddleware);

/**
 * GET /api/usage
 * Returns the authenticated user's usage entries, optionally filtered
 * by tool and/or date range via query parameters.
 * FR9: data for graph. FR10: filtering support.
 */
router.get('/usage', async (req, res) => {
  const { tool, from, to } = req.query;

  const filter = { userId: req.user.id };

  if (tool && tool !== 'All') {
    filter.tool = tool;
  }

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to)   filter.date.$lte = new Date(to);
  }

  try {
    const entries = await UsageEntry.find(filter).sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch usage data.' });
  }
});

/**
 * GET /api/guidelines
 * Returns all ethical guidelines ordered by their display order.
 * FR11: ethical guidelines.
 */
router.get('/guidelines', async (req, res) => {
  try {
    const guidelines = await Guideline.find().sort({ order: 1 });
    res.json(guidelines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch guidelines.' });
  }
});

/**
 * GET /api/resources
 * Returns all educational resources and their embedded quiz questions.
 * FR12: educational resources and quiz.
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resources.' });
  }
});

/**
 * POST /api/quiz/submit
 * Accepts an array of { resourceId, question, answer } objects.
 * Evaluates each answer against the expected answers stored in the DB
 * and returns a score. A score >= 80% is considered passing (FR12).
 */
router.post('/quiz/submit', async (req, res) => {
  const { answers } = req.body; // [{ resourceId, question, answer }]

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers array is required.' });
  }

  try {
    let correct = 0;
    let total = answers.length;

    for (const submission of answers) {
      const resource = await Resource.findById(submission.resourceId);
      if (!resource) continue;

      const matchedQ = resource.quizQuestions.find(
        (q) => q.question === submission.question
      );

      if (matchedQ && matchedQ.expectedAnswer.toLowerCase() === submission.answer.toLowerCase()) {
        correct++;
      }
    }

    const score = Math.round((correct / total) * 100);
    const passed = score >= 80;

    res.json({ score, passed, correct, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to evaluate quiz.' });
  }
});

/**
 * GET /api/feedback
 * Aggregates the user's usage data for the current week and produces
 * a dynamic feedback string based on which tool dominates. FR13.
 */
router.get('/feedback', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await UsageEntry.find({
      userId: req.user.id,
      date: { $gte: sevenDaysAgo },
    });

    if (entries.length === 0) {
      return res.json({ feedback: 'No AI usage recorded in the past 7 days. Start logging your sessions to receive personalised feedback.' });
    }

    // Aggregate hours per tool
    const totals = {};
    for (const e of entries) {
      totals[e.tool] = (totals[e.tool] || 0) + e.hours;
    }

    const topTool = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    const totalHours = Object.values(totals).reduce((s, v) => s + v, 0);

    const messages = {
      'ChatGPT':        `You used ChatGPT for ${topTool[1]} hours this week. Remember to critically evaluate its outputs and not rely on them as a primary source.`,
      'GitHub Copilot': `GitHub Copilot was your most-used tool this week (${topTool[1]} hours). Make sure you understand every snippet it suggests before accepting it.`,
      'Claude':         `Claude accounted for ${topTool[1]} of your ${totalHours} hours of AI use this week. Reflect on whether AI assistance is supplementing or replacing your own reasoning.`,
    };

    res.json({ feedback: messages[topTool[0]] || 'Keep tracking your AI usage to receive tailored feedback.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate feedback.' });
  }
});

/**
 * GET /api/dashboard/config
 * Returns the authenticated user's personal dashboard configuration. FR8.
 */
router.get('/dashboard/config', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('dashboardConfig username');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ username: user.username, dashboardConfig: user.dashboardConfig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard config.' });
  }
});

/**
 * PATCH /api/dashboard/config
 * Updates the authenticated user's dashboard widget visibility. FR8.
 */
router.patch('/dashboard/config', async (req, res) => {
  const allowed = ['showGraph', 'showGuidelines', 'showResources', 'showFeedback'];
  const updates = {};

  for (const key of allowed) {
    if (typeof req.body[key] === 'boolean') {
      updates[`dashboardConfig.${key}`] = req.body[key];
    }
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: 'dashboardConfig' }
    );
    res.json(user.dashboardConfig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update dashboard config.' });
  }
});

export default router;
