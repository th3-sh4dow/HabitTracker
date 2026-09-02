import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const VALID_TIMEZONES = Intl.supportedValuesOf('timeZone');

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('timezone')
      .notEmpty()
      .custom(tz => {
        if (!VALID_TIMEZONES.includes(tz)) {
          throw new Error(`"${tz}" is not a valid IANA timezone.`);
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, timezone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, timezone },
      select: { id: true, email: true, timezone: true, createdAt: true },
    });

    const token = signToken(user.id);
    return res.status(201).json({ token, user });
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    const safeUser = { id: user.id, email: user.email, timezone: user.timezone, createdAt: user.createdAt };
    return res.json({ token, user: safeUser });
  }
);

router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

router.patch(
  '/me',
  authenticate,
  [
    body('timezone')
      .optional()
      .custom(tz => {
        if (!VALID_TIMEZONES.includes(tz)) {
          throw new Error(`"${tz}" is not a valid IANA timezone.`);
        }
        return true;
      }),
    body('currentPassword').optional().isString(),
    body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { timezone, currentPassword, newPassword } = req.body;
    const updates = {};

    if (timezone) {
      updates.timezone = timezone;
    }

    if (currentPassword && newPassword) {
      const fullUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      const valid = await bcrypt.compare(currentPassword, fullUser.password);
      if (!valid) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update fields provided.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: { id: true, email: true, timezone: true, createdAt: true },
    });

    return res.json({ user: updated });
  }
);

export default router;
