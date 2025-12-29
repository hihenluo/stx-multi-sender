import { useState, useEffect } from 'react';
import { isConnected, disconnect, getLocalStorage, connect } from '@stacks/connect';

export function useStacksAuth() {
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  const syncAddress = (data: any) => {
    const addr = data?.addresses?.stx?.[0]?.address || 
                 data?.addresses?.find?.((a: any) => a.symbol === 'STX')?.address;
    if (addr) setStxAddress(addr);
  };

  useEffect(() => {
    if (isConnected()) syncAddress(getLocalStorage());
  }, []);

  const handleConnect = async () => {
    if (isConnected()) {
      disconnect();
      setStxAddress(null);
    } else {
      const response = await connect();
      syncAddress(response);
    }
  };

  return { stxAddress, handleConnect, isConnected: isConnected() };
}