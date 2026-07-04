import { useState } from 'react';
export function usePayment() {
  const [payment, setPayment] = useState({ amount: 0, method: 'bKash', txnId: '', status: 'idle' });
  const methods = ['bKash', 'Nagad', 'Rocket', 'Cash', 'Stripe'];
  const processPayment = async (amount, method) => {
    setPayment(p => ({ ...p, amount, method, status: 'processing' }));
    await new Promise(r => setTimeout(r, 1500));
    setPayment(p => ({ ...p, status: 'success', txnId: 'TXN' + Date.now() }));
    return { success: true, txnId: 'TXN' + Date.now() };
  };
  return { payment, methods, processPayment, setPayment };
}