'use server';

import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { STATUSES, UNITS, pick, type Status } from '@/lib/report-meta';

export interface StatusFormState {
  error?: string;
  ok?: boolean;
}

// رندر صفحه مرز امنیتی نیست؛ هر اکشن باید خودش احراز هویت کند
async function assertAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error('Forbidden');
}

export async function updateReportStatus(_prev: StatusFormState | undefined, formData: FormData): Promise<StatusFormState> {
  await assertAdmin();

  const reportId = String(formData.get('reportId') ?? '');
  const status = String(formData.get('status') ?? '') as Status;
  const unit = pick(UNITS, formData.get('assignedUnit'));
  const note = String(formData.get('note') ?? '').trim().slice(0, 500) || null;

  if (!STATUSES.includes(status)) return { error: 'وضعیت نامعتبر است.' };
  if (status === 'assigned' && !unit) return { error: 'برای ارجاع، واحد مسئول را انتخاب کنید.' };
  if (status === 'rejected' && !note) return { error: 'برای رد گزارش، دلیل را بنویسید.' };

  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { assignedUnit: true } });
  if (!report) return { error: 'گزارش پیدا نشد.' };

  const assignedUnit = unit ?? report.assignedUnit;
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      assignedUnit,
      ...(note && { statusNote: note }),
      events: { create: { status, assignedUnit, note } },
    },
  });

  revalidatePath('/admin');
  revalidatePath('/public/list');
  return { ok: true };
}

export async function deleteReport(formData: FormData) {
  await assertAdmin();
  const reportId = String(formData.get('reportId') ?? '');
  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { photoUrl: true } });
  if (!report) return;
  if (report.photoUrl) {
    await unlink(path.join(process.cwd(), 'public', 'uploads', path.basename(report.photoUrl))).catch(() => {});
  }
  await prisma.report.delete({ where: { id: reportId } });
  revalidatePath('/admin');
  revalidatePath('/public/list');
}
