import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const token = authHeader.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Fetch user from DB to ensure they still exist
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, timezone: true, createdAt: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }

  req.user = user;
  next();
}
