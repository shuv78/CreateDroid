import { useState } from 'react';
export function useScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const startScan = async () => {
    setScanning(true);
    try {
      const Html5Qrcode = (await import('html5-qrcode')).Html5Qrcode;
      const scanner = new Html5Qrcode('reader');
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } },
        decoded => { setResult(decoded); setScanning(false); scanner.stop(); },
        err => { if (err?.message?.includes('NotFoundException')) return; }
      );
    } catch (e) { console.error('Scanner error:', e); setScanning(false); }
  };
  return { scanning, result, startScan };
}