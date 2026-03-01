import express from 'express';
import authMiddleware, { requireRole } from '../middleware/auth.js';
import UsageEntry from '../models/UsageEntry.js';
import Guideline from '../models/Guideline.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

const router = express.Router();

// All routes below require a valid JWT
router.use(authMiddleware);

/**
 * POST /api/logs
 * Creates a manual AI usage log for the authenticated user.
 * FR4: manual log creation, FR5: captures tool, purpose/task, output and time.
 */
router.post('/logs', async (req, res) => {
  const {
    tool,
    task,
    aiOutput,
    hours,
    subject = '',
    assignmentId = '',
    note = '',
    date,
  } = req.body;

  if (!tool || !task || !aiOutput || typeof hours !== 'number') {
    return res.status(400).json({ error: 'tool, task, aiOutput and numeric hours are required.' });
  }

  if (hours <= 0 || hours > 24) {
    return res.status(400).json({ error: 'hours must be between 0 and 24.' });
  }

  try {
    const entry = await UsageEntry.create({
      userId: req.user.id,
      tool,
      task,
      aiOutput,
      hours,
      subject,
      assignmentId,
      note,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create usage log.' });
  }
});

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
 * Aggregates the user's usage data for the current week vs previous week,
 * producing dynamic, actionable feedback based on trends and dominant tools (FR13).
 */
router.get('/feedback', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // Fetch last 14 days of data to compare week-over-week
    const entries = await UsageEntry.find({
      userId: req.user.id,
      date: { $gte: fourteenDaysAgo },
    });

    const currentWeekEntries = entries.filter(e => e.date >= sevenDaysAgo);
    const previousWeekEntries = entries.filter(e => e.date < sevenDaysAgo);

    if (currentWeekEntries.length === 0) {
      return res.json({ feedback: 'No AI usage recorded in the past 7 days. Start logging your sessions to receive personalised feedback.' });
    }

    // Aggregate hours for current week
    const currentTotals = {};
    for (const e of currentWeekEntries) {
      currentTotals[e.tool] = (currentTotals[e.tool] || 0) + e.hours;
    }

    const previousTotalHours = previousWeekEntries.reduce((sum, e) => sum + e.hours, 0);
    const currentTotalHours = Object.values(currentTotals).reduce((sum, v) => sum + v, 0);
    const topTool = Object.entries(currentTotals).sort((a, b) => b[1] - a[1])[0];

    // 1. Build trend insight
    let feedbackStr = `You used AI for ${currentTotalHours.toFixed(1)} hours this week`;
    if (previousTotalHours > 0) {
      const diff = currentTotalHours - previousTotalHours;
      if (diff > 0) {
        feedbackStr += ` (up ${diff.toFixed(1)} hrs from last week). `;
      } else if (diff < 0) {
        feedbackStr += ` (down ${Math.abs(diff).toFixed(1)} hrs from last week). `;
      } else {
        feedbackStr += `, the same amount as last week. `;
      }
    } else {
      feedbackStr += `. `;
    }

    // 2. High usage warning
    if (currentTotalHours >= 20) {
      feedbackStr += `Warning: That's a very high amount of AI usage. Make sure you are using these tools to support your learning, not as a replacement for your own cognitive effort. `;
    }

    // 3. Tool-specific tips
    const toolTips = {
      'ChatGPT': `Since ChatGPT was your primary tool (${topTool[1].toFixed(1)} hrs), remember to critically evaluate its textual outputs for hallucinations.`,
      'GitHub Copilot': `GitHub Copilot drove most of your usage (${topTool[1].toFixed(1)} hrs). Ensure you fully understand every snippet before integrating it.`,
      'Claude': `Claude was your most-used tool (${topTool[1].toFixed(1)} hrs). Reflect on whether its reasoning is supplementing or bypassing your own analysis.`
    };

    feedbackStr += toolTips[topTool[0]] || '';

    res.json({ feedback: feedbackStr.trim() });
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

/**
 * GET /api/admin/system-status
 * Returns lightweight system counters for admin users only. FR43.
 */
router.get('/admin/system-status', requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, totalUsageEntries] = await Promise.all([
      User.countDocuments(),
      UsageEntry.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalUsageEntries,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch system status.' });
  }
});

export default router;
