// Device Fingerprinting Utility
// Creates a unique device ID based on browser characteristics

/**
 * Generates a device fingerprint hash
 * Combines: IP (partial), UserAgent, Screen size, Timezone, Language
 */
export const generateDeviceFingerprint = async () => {
  // Get browser/device characteristics
  const userAgent = navigator.userAgent;
  const screenWidth = screen.width;
  const screenHeight = screen.height;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  
  // Get stored seed or create new one
  let seed = localStorage.getItem('device_seed');
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
    localStorage.setItem('device_seed', seed);
  }

  // Try to get IP (will be null in browser, but structure ready for server-side)
  let ipAddress = null;
  try {
    // In browser, we can't directly get IP, but server can extract it
    // For now, we'll use a placeholder that server will replace
    ipAddress = 'browser';
  } catch (e) {
    // Ignore
  }

  // Combine all characteristics
  const fingerprintString = [
    userAgent,
    screenWidth,
    screenHeight,
    timezone,
    language,
    platform,
    seed
  ].join('|');

  // Simple hash function (for demo - in production use crypto.subtle)
  const hash = await simpleHash(fingerprintString);
  
  return {
    deviceId: hash,
    fingerprint: fingerprintString,
    metadata: {
      userAgent,
      screenWidth,
      screenHeight,
      timezone,
      language,
      platform,
      seed
    }
  };
};

/**
 * Simple hash function (SHA-256 would be better, but this works for demo)
 */
const simpleHash = async (str) => {
  // Use Web Crypto API if available
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }
  
  // Fallback simple hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
};

/**
 * Get stored device ID or generate new one
 */
export const getOrCreateDeviceId = async () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    const fingerprint = await generateDeviceFingerprint();
    deviceId = fingerprint.deviceId;
    localStorage.setItem('device_id', deviceId);
    localStorage.setItem('device_metadata', JSON.stringify(fingerprint.metadata));
  }
  return deviceId;
};
