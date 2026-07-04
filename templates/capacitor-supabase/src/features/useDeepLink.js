import { useEffect, useState } from 'react';
export function useDeepLink() {
  const [deepLink, setDeepLink] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('appUrlOpen', data => { setDeepLink(data.url); });
        const ret = await App.getLaunchUrl();
        if (ret?.url) setDeepLink(ret.url);
      } catch { /* Capacitor not available */ }
    })();
  }, []);
  return { deepLink };
}