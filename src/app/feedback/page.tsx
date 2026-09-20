'use client';

import { useState } from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { AppHeader, Surface } from '@/components/ui';
import { toFa } from '@/lib/format';

const SUS_QUESTIONS = [
  "فکر می‌کنم دوست دارم از این سامانه به طور مکرر استفاده کنم.",
  "سامانه را بیش از حد پیچیده یافتم.",
  "فکر می‌کنم استفاده از این سامانه آسان است.",
  "فکر می‌کنم برای استفاده از این سامانه به کمک یک فرد فنی نیاز دارم.",
  "توابع مختلف در این سامانه به خوبی یکپارچه شده‌اند.",
  "فکر می‌کنم در این سامانه تناقض‌های زیادی وجود دارد.",
  "تصور می‌کنم اکثر مردم خیلی سریع یاد می‌گیرند که چگونه از این سامانه استفاده کنند.",
  "استفاده از سامانه را بسیار دست و پا گیر (آزاردهنده) یافتم.",
  "هنگام استفاده از این سامانه احساس اطمینان زیادی داشتم.",
  "قبل از اینکه بتوانم به کار با این سامانه بپردازم، باید چیزهای زیادی یاد می‌گرفتم."
];

export default function FeedbackPage() {
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));
  const [freeComment, setFreeComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const calculateSUS = () => {
    let sum = 0;
    scores.forEach((score, index) => {
      // score is 1-5
      // odd questions (index 0, 2, 4, 6, 8): score - 1
      // even questions (index 1, 3, 5, 7, 9): 5 - score
      if (index % 2 === 0) {
        sum += (score - 1);
      } else {
        sum += (5 - score);
      }
    });
    return sum * 2.5;
  };

  const handleSubmit = async () => {
    if (scores.includes(0)) {
      alert('لطفاً به تمام سوالات پاسخ دهید.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // We will send stringified scores array and freeComment to API
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          susScores: JSON.stringify(scores),
          freeComment,
          reporterToken: localStorage.getItem('reporter_token') || 'unknown',
        })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Server error');
      }
    } catch {
      alert('خطا در ارسال بازخورد');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="app-bg flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle size={48} />
        </div>
        <h1 className="mb-2 text-2xl font-black text-slate-950">از بازخورد شما سپاسگزاریم</h1>
        <p className="mb-8 text-slate-600">نمره SUS شما: <span className="font-black text-blue-700">{toFa(calculateSUS())}</span> از {toFa(100)}</p>
        <Link href="/" className="w-full max-w-sm rounded-xl bg-blue-600 px-6 py-3 font-bold text-white">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <div className="app-bg flex min-h-screen flex-col">
      <AppHeader title="ارزیابی سامانه (SUS)" eyebrow={`${toFa(scores.filter(Boolean).length)} از ${toFa(10)} پاسخ`} icon={HelpCircle} />

      <main className="p-4 max-w-lg mx-auto w-full pb-24">
        <Surface className="mb-5 p-4">
          <p className="text-sm leading-7 text-slate-600">
          لطفاً برای هر یک از جملات زیر، میزان موافقت یا مخالفت خود را مشخص کنید. این بازخورد در ارزیابی نهایی پژوهش بسیار کمک‌کننده است.
          </p>
        </Surface>

        <div className="space-y-4">
          {SUS_QUESTIONS.map((question, qIndex) => (
            <Surface key={qIndex} className="p-4">
              <p className="mb-4 font-bold leading-7 text-slate-900">{toFa(qIndex + 1)}. {question}</p>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2 px-1">
                <span>کاملاً مخالفم</span>
                <span>کاملاً موافقم</span>
              </div>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      const newScores = [...scores];
                      newScores[qIndex] = val;
                      setScores(newScores);
                    }}
                    className={`min-h-11 flex-1 rounded-lg border font-extrabold transition-colors ${
                      scores[qIndex] === val 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {toFa(val)}
                  </button>
                ))}
              </div>
            </Surface>
          ))}

          <Surface className="p-4">
            <p className="font-medium text-slate-800 mb-4">نظرات و پیشنهادات آزاد (اختیاری)</p>
            <textarea 
              value={freeComment}
              onChange={e => setFreeComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اگر نکته‌ای درباره طراحی یا کارکرد سامانه دارید..."
            ></textarea>
          </Surface>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mx-auto block w-full max-w-lg rounded-xl bg-blue-600 py-4 text-lg font-extrabold text-white transition-colors active:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? 'در حال ارسال...' : 'ثبت بازخورد'}
        </button>
      </div>
    </div>
  );
}
