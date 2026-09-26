import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, createdAt: true },
  });
  return user;
});
