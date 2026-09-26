'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';

export interface AuthFormState {
  error?: string;
}

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' })
    .max(20, { error: 'نام کاربری نباید بیشتر از ۲۰ کاراکتر باشد.' })
    .regex(/^[a-zA-Z0-9_]+$/, { error: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و خط زیر باشد.' }),
  password: z.string().min(6, { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }).max(72),
});

export async function signup(_prevState: AuthFormState | undefined, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'اطلاعات وارد شده معتبر نیست.' };
  }
  const { username, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (existing) {
    return { error: 'این نام کاربری قبلاً ثبت شده است.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, passwordHash },
    select: { id: true, username: true },
  });

  await createSession(user.id, user.username);
  redirect('/profile');
}

export async function login(_prevState: AuthFormState | undefined, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'نام کاربری یا رمز عبور نامعتبر است.' };
  }
  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, passwordHash: true } });
  if (!user) {
    return { error: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  await createSession(user.id, user.username);
  redirect('/profile');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
