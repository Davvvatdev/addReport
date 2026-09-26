'use server';

import { redirect } from 'next/navigation';
import { createAdminSession, destroyAdminSession, verifyAdminPassword } from '@/lib/adminAuth';

export interface AdminAuthFormState {
  error?: string;
}

export async function adminLogin(_prevState: AdminAuthFormState | undefined, formData: FormData): Promise<AdminAuthFormState> {
  const password = String(formData.get('password') ?? '');

  if (!password || !verifyAdminPassword(password)) {
    return { error: 'رمز عبور اشتباه است.' };
  }

  await createAdminSession();
  redirect('/admin');
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect('/admin/login');
}
