import { useState } from 'react';
export function useBiometric() {
  const [available, setAvailable] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const checkAvailability = async () => {
    try {
      const { BiometricAuth } = await import('@capacitor/biometric-auth');
      const result = await BiometricAuth.checkBiometry();
      setAvailable(result.isAvailable);
      return result.isAvailable;
    } catch { setAvailable(false); return false; }
  };
  const authenticate = async () => {
    try {
      const { BiometricAuth } = await import('@capacitor/biometric-auth');
      const result = await BiometricAuth.performBiometric({ reason: 'Authenticate to continue' });
      if (result) setAuthenticated(true);
      return result;
    } catch { return false; }
  };
  return { available, authenticated, checkAvailability, authenticate };
}