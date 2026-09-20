import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';

const MAX_BYTES = 700 * 1024;
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const match = typeof body?.photo === 'string' ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(body.photo) : null;
  if (!match) return Response.json({ error: 'invalid photo' }, { status: 400 });

  const report = await prisma.report.findUnique({ where: { id }, include: { subcategory: true } });
  if (!report) return Response.json({ error: 'not found' }, { status: 404 });
  if (report.photoUrl) return Response.json({ photoUrl: report.photoUrl });
  // عکس فقط برای زیرمسئله‌های عکس‌پذیر و غیرحساس
  if (!report.subcategory.allowsPhoto || report.subcategory.isSensitive) {
    return Response.json({ error: 'photo not allowed' }, { status: 403 });
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) return Response.json({ error: 'too large' }, { status: 413 });

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const fileName = `${id}.${EXT[match[1]]}`;
  await writeFile(path.join(dir, fileName), buffer);

  const photoUrl = `/uploads/${fileName}`;
  await prisma.report.update({ where: { id }, data: { photoUrl } });
  return Response.json({ photoUrl });
}
