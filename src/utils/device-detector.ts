/**
 * 设备检测工具
 * 用于检测用户设备类型、浏览器类型和操作系统
 */

export interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isSafari: boolean;
  isAndroid: boolean;
  browserName: string;
  osVersion: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  return mobileRegex.test(userAgent) || 
         (window.innerWidth <= 768 && 'ontouchstart' in window);
}

/**
 * 检测是否为iOS设备
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * 检测是否为Safari浏览器
 */
export function isSafariBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  
  return isSafari;
}

/**
 * 检测是否为Android设备
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

/**
 * 获取iOS版本
 */
export function getIOSVersion(): string {
  if (!isIOSDevice()) return '';
  
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (match) {
    return `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
  }
  
  return '';
}

/**
 * 获取Safari版本
 */
export function getSafariVersion(): string {
  if (!isSafariBrowser()) return '';
  
  const match = navigator.userAgent.match(/Version\/(\d+\.\d+)/);
  if (match) {
    return match[1];
  }
  
  return '';
}

/**
 * 获取完整的设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const isMobile = isMobileDevice();
  const isIOS = isIOSDevice();
  const isSafari = isSafariBrowser();
  const isAndroid = isAndroidDevice();
  
  let browserName = 'Unknown';
  if (isSafari) {
    browserName = 'Safari';
  } else if (/chrome/.test(navigator.userAgent.toLowerCase())) {
    browserName = 'Chrome';
  } else if (/firefox/.test(navigator.userAgent.toLowerCase())) {
    browserName = 'Firefox';
  }
  
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) {
    deviceType = /ipad|tablet/.test(navigator.userAgent.toLowerCase()) ? 'tablet' : 'mobile';
  }
  
  const osVersion = isIOS ? getIOSVersion() : '';
  
  return {
    isMobile,
    isIOS,
    isSafari,
    isAndroid,
    browserName,
    osVersion,
    deviceType,
  };
}

/**
 * Hook: 使用设备检测
 */
export function useDeviceDetector(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isSafari: false,
      isAndroid: false,
      browserName: 'Unknown',
      osVersion: '',
      deviceType: 'desktop',
    };
  }
  
  return getDeviceInfo();
}

/**
 * 日志设备信息（用于调试）
 */
export function logDeviceInfo(): void {
  const info = getDeviceInfo();
  console.log('=== Device Information ===');
  console.log('Device Type:', info.deviceType);
  console.log('Is Mobile:', info.isMobile);
  console.log('Is iOS:', info.isIOS);
  console.log('Is Safari:', info.isSafari);
  console.log('Is Android:', info.isAndroid);
  console.log('Browser:', info.browserName);
  console.log('OS Version:', info.osVersion || 'N/A');
  console.log('User Agent:', navigator.userAgent);
  console.log('=========================');
}

