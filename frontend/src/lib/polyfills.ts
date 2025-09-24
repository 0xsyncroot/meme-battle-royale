// Polyfills for client-side libraries
// This file should be imported early in the app lifecycle

// Polyfill global for libraries that expect Node.js environment
if (typeof window !== 'undefined') {
  // Only run on client side
  if (typeof (globalThis as any).global === 'undefined') {
    (globalThis as any).global = globalThis;
  }
  
  // Additional polyfills can be added here if needed
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = globalThis;
  }
  
  // Ensure Buffer is available if needed by the SDK
  if (typeof (window as any).Buffer === 'undefined') {
    try {
      const { Buffer } = require('buffer');
      (window as any).Buffer = Buffer;
    } catch (e) {
      // Buffer not available, that's ok
    }
  }
}

export {}; // Make this a module
