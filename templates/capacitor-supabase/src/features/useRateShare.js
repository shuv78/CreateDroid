import { useState } from 'react';
export function useRateShare() {
  const [shared, setShared] = useState(false);
  const shareApp = async (title = 'MyApp', url = 'https://play.google.com/store/apps/details?id=com.example.app') => {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text: `Check out ${title}!`, url });
      setShared(true);
    } catch { /* User cancelled or not available */ }
  };
  const rateApp = (url = 'https://play.google.com/store/apps/details?id=com.example.app') => {
    window.open(url, '_system');
  };
  return { shared, shareApp, rateApp };
}