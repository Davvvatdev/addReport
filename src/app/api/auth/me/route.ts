import { getCurrentUser } from '@/lib/dal';

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user: user ? { username: user.username } : null });
}
