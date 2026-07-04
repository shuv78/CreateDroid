import { useState, useEffect } from 'react';
export function useNotifications() {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);
  useEffect(() => {
    if ('Notification' in window) { setPermission(Notification.permission); }
  }, []);
  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.register();
        PushNotifications.addListener('registration', t => setToken(t.value));
        PushNotifications.addListener('pushNotificationReceived', n => console.log('Notification:', n));
      } catch { /* Capacitor not available */ }
    }
  };
  return { token, permission, requestPermission };
}