import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { computeStreaks, todayInTimezone } from '../services/streaks.js';

const router = Router();

router.use(authenticate);

function withStreaks(habit, timezone) {
  const localDates = habit.checkIns.map(c => c.localDate);
  const today = todayInTimezone(timezone);
  const { currentStreak, longestStreak } = computeStreaks(localDates, today);
  const checkedInToday = localDates.includes(today);

  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    createdAt: habit.createdAt,
    currentStreak,
    longestStreak,
    checkedInToday,
    recentDays: buildRecentDays(localDates, today),
  };
}

function buildRecentDays(localDates, todayStr) {
  const dateSet = new Set(localDates);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      completed: dateSet.has(dateStr),
      isToday: i === 0,
    });
  }
  return days;
}

router.get('/', async (req, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user.id },
    include: { checkIns: { select: { localDate: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const result = habits.map(h => withStreaks(h, req.user.timezone));
  return res.json({ habits: result });
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Habit name is required.'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const habit = await prisma.habit.create({
      data: { name, description: description ?? null, userId: req.user.id },
      include: { checkIns: { select: { localDate: true } } },
    });

    return res.status(201).json({ habit: withStreaks(habit, req.user.timezone) });
  }
);

router.get('/:id', async (req, res) => {
  const habit = await prisma.habit.findUnique({
    where: { id: req.params.id },
    include: {
      checkIns: {
        select: { id: true, localDate: true, checkedAt: true },
        orderBy: { localDate: 'desc' },
      },
    },
  });

  if (!habit) return res.status(404).json({ error: 'Habit not found.' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

  return res.json({ habit: withStreaks(habit, req.user.timezone), checkIns: habit.checkIns });
});

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Habit name cannot be empty.'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const habit = await prisma.habit.findUnique({ where: { id: req.params.id } });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });
    if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    const { name, description } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;

    const updated = await prisma.habit.update({
      where: { id: req.params.id },
      data,
      include: { checkIns: { select: { localDate: true } } },
    });

    return res.json({ habit: withStreaks(updated, req.user.timezone) });
  }
);

router.delete('/:id', async (req, res) => {
  const habit = await prisma.habit.findUnique({ where: { id: req.params.id } });
  if (!habit) return res.status(404).json({ error: 'Habit not found.' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

  await prisma.habit.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
