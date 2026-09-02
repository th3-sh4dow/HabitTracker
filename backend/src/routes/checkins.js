import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { computeStreaks, todayInTimezone, toLocalDateString, isValidLocalDate } from '../services/streaks.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  [body('localDate').optional().isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { habitId } = req.params;
    const { timezone } = req.user;

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { checkIns: { select: { localDate: true } } },
    });

    if (!habit) return res.status(404).json({ error: 'Habit not found.' });
    if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    const todayLocal = todayInTimezone(timezone);
    let localDate = req.body.localDate ?? todayLocal;

    if (!isValidLocalDate(localDate)) {
      return res.status(400).json({ error: `"${localDate}" is not a valid date. Use YYYY-MM-DD format.` });
    }

    if (localDate > todayLocal) {
      return res.status(400).json({
        error: `Cannot check in for a future date. Today in your timezone (${timezone}) is ${todayLocal}.`,
      });
    }

    const habitCreatedLocal = toLocalDateString(habit.createdAt, timezone);
    if (localDate < habitCreatedLocal) {
      return res.status(400).json({
        error: `Cannot check in before the habit was created. Habit was created on ${habitCreatedLocal} in your timezone.`,
      });
    }

    const existingDates = new Set(habit.checkIns.map(c => c.localDate));
    if (existingDates.has(localDate)) {
      return res.status(409).json({
        error: `You already checked in for ${localDate}. Only one check-in per local day is allowed.`,
      });
    }

    let checkIn;
    try {
      checkIn = await prisma.checkIn.create({
        data: {
          habitId,
          localDate,
          checkedAt: new Date(),
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          error: `You already checked in for ${localDate}. Only one check-in per local day is allowed.`,
        });
      }
      throw err;
    }

    const allDates = [...existingDates, localDate];
    const { currentStreak, longestStreak } = computeStreaks(allDates, todayLocal);

    return res.status(201).json({
      checkIn,
      currentStreak,
      longestStreak,
    });
  }
);

router.get('/', async (req, res) => {
  const { habitId } = req.params;

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) return res.status(404).json({ error: 'Habit not found.' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
  const skip = (page - 1) * limit;

  const [checkIns, total] = await prisma.$transaction([
    prisma.checkIn.findMany({
      where: { habitId },
      orderBy: { localDate: 'desc' },
      skip,
      take: limit,
      select: { id: true, localDate: true, checkedAt: true },
    }),
    prisma.checkIn.count({ where: { habitId } }),
  ]);

  return res.json({
    checkIns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

router.delete('/:checkInId', async (req, res) => {
  const { habitId, checkInId } = req.params;

  const checkIn = await prisma.checkIn.findUnique({
    where: { id: checkInId },
    include: { habit: true },
  });

  if (!checkIn) return res.status(404).json({ error: 'Check-in not found.' });
  if (checkIn.habitId !== habitId) return res.status(400).json({ error: 'Check-in does not belong to this habit.' });
  if (checkIn.habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

  await prisma.checkIn.delete({ where: { id: checkInId } });
  return res.status(204).send();
});

export default router;
