import { useState, useEffect, useCallback } from 'react';
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState(JSON.parse(localStorage.getItem('offlineQueue') || '[]'));
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);
  const addToQueue = useCallback((action, data) => {
    const newQueue = [...queue, { action, data, timestamp: Date.now(), id: crypto.randomUUID() }];
    setQueue(newQueue);
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
  }, [queue]);
  return { isOnline, queue, addToQueue };
}