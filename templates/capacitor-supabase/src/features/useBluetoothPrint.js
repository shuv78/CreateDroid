import { useState } from 'react';
export function useBluetoothPrint() {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const scanDevices = async () => {
    try {
      const { BluetoothLe } = await import('@capacitor/bluetooth-le');
      const result = await BluetoothLe.requestLEScan({ services: [] });
      setDevices(result?.devices || []);
      return result?.devices || [];
    } catch (e) { console.error('Bluetooth scan error:', e); return []; }
  };
  const printReceipt = async (lines) => {
    if (!connected) { console.error('No printer connected'); return false; }
    const receipt = lines.map(l => l + '\n').join('');
    console.log('Printing:', receipt);
    return true;
  };
  return { connected, devices, scanDevices, printReceipt, setConnected };
}