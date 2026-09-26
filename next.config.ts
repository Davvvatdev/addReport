import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  // نشانگر توسعهٔ Next.js پایین-چپ روی دکمهٔ «ثبت گزارش» نوار شناور می‌افتاد
  devIndicators: { position: 'top-left' },
  experimental: {
    cpus: 1,
  },
};

export default withSerwist(nextConfig);
