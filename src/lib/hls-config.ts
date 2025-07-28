/**
 * HLS.js Configuration Utility
 * Provides a centralized, worker-free configuration for HLS.js
 * Follows Single Responsibility Principle - Only handles HLS configuration
 */

import Hls from 'hls.js';

/**
 * Creates a worker-free HLS configuration that prevents MODULE_NOT_FOUND errors
 * @returns HLS configuration object
 */
export function createWorkerFreeHlsConfig(): Partial<Hls['config']> {
  return {
    // Core worker disabling
    enableWorker: false,
    workerPath: undefined,
    
    // Disable all worker-dependent features
    enableWebVTT: false,
    enableIMSC1: false,
    enableCEA708Captions: false,
    
    // Performance optimizations without workers
    debug: process.env.NODE_ENV === 'development',
    lowLatencyMode: true,
    backBufferLength: 90,
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    
    // Network resilience
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 1,
    levelLoadingTimeOut: 10000,
    levelLoadingMaxRetry: 2,
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 3,
    
    // Error handling
    startFragPrefetch: true,
    testBandwidth: false,
  };
}

/**
 * Creates an HLS instance with worker-free configuration
 * @param customConfig Additional configuration to merge
 * @returns Configured HLS instance
 */
export function createWorkerFreeHls(customConfig?: Partial<Hls['config']>): Hls {
  const baseConfig = createWorkerFreeHlsConfig();
  const finalConfig = { ...baseConfig, ...customConfig };
  
  // Additional runtime check to ensure workers are disabled
  if (finalConfig.enableWorker) {
    console.warn('⚠️ HLS worker was enabled, forcing disable to prevent errors');
    finalConfig.enableWorker = false;
    finalConfig.workerPath = undefined;
  }
  
  return new Hls(finalConfig);
}

/**
 * Checks if HLS is supported in the current environment
 * @returns boolean indicating HLS support
 */
export function isHlsSupported(): boolean {
  return Hls.isSupported();
}

/**
 * Safe HLS cleanup utility
 * @param hls HLS instance to cleanup
 */
export function cleanupHls(hls: Hls | null): void {
  if (!hls) return;
  
  try {
    if (hls.media) {
      hls.detachMedia();
    }
    hls.destroy();
  } catch (error) {
    console.warn('⚠️ Error during HLS cleanup:', error);
  }
}
