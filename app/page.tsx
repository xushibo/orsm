'use client';

import { ErrorBoundary } from '@/src/components/shared/ErrorBoundary';
import { MobileCamera } from '@/src/components/mobile/MobileCamera';
import { useDeviceDetector } from '@/src/utils/device-detector';

export default function Home() {
  const deviceInfo = useDeviceDetector();

  console.log('=== Application Started ===');
  console.log('Device Info:', deviceInfo);

  return (
    <ErrorBoundary>
      {/* 移动端和PC端都使用优化的MobileCamera组件 */}
      <MobileCamera />
    </ErrorBoundary>
  );
}