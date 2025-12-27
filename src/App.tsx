import { useState, useMemo, useEffect } from 'react';
import { connect, isConnected, disconnect, getLocalStorage, request } from '@stacks/connect';
import { uintCV, listCV, principalCV } from '@stacks/transactions';

// contract configuration
const CONTRACT_ADDRESS = 'SP32YN03PMDGXQA9HYEZS2WBAT32AZKDJTBAPF4T';
const CONTRACT_NAME = 'stx-multi-send';

function App() {
  const [addressInput, setAddressInput] = useState('');
  const [amount, setAmount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState('');
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  // sync wallet session on mount
  useEffect(() => {
    if (isConnected()) {
      const userData = getLocalStorage() as any;
      // logic to handle both array or object structure
      const addr = userData?.addresses?.stx?.[0]?.address || 
                   userData?.addresses?.find?.((a: any) => a.symbol === 'STX')?.address;
      
      if (addr) setStxAddress(addr);
    }
  }, []);

  // connect wallet logic
  const handleConnect = async () => {
    try {
      if (isConnected()) {
        disconnect();
        setStxAddress(null);
        return;
      }

      const response = await connect() as any;
      // handles the response structure from v8.x
      const addr = response?.addresses?.stx?.[0]?.address || 
                   response?.addresses?.find?.((a: any) => a.symbol === 'STX')?.address;
      
      if (addr) setStxAddress(addr);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // parse recipients from textarea
  const addressList = useMemo(() => {
    return addressInput
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.startsWith('SP'));
  }, [addressInput]);

  const isValidCount = addressList.length >= 5 && addressList.length <= 50;

  // trigger smart contract call
  const handleAirdrop = async () => {
    if (!isValidCount) return;
    if (!isConnected()) {
      await handleConnect();
      return;
    }

    setIsSubmitting(true);
    try {
      // request method for stacks-connect v8+
      const response: any = await request('stx_callContract', {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`, 
        functionName: 'airdrop-stx',
        functionArgs: [
          listCV(addressList.map(addr => principalCV(addr))),
          uintCV(Math.floor(amount * 1000000)) 
        ],
        network: 'mainnet'
      });

      if (response?.txid) {
        setTxId(response.txid);
        setAddressInput('');
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("Airdrop failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500/30">
      
      {/* nav bar */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 bg-slate-950/90 backdrop-blur-sm z-50 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold italic shadow-lg">S</div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">STX<span className="text-orange-500">Airdrop</span></h1>
        </div>
        
        <button 
          onClick={handleConnect}
          className="bg-slate-800 hover:bg-slate-700 text-sm py-2 px-6 rounded-full border border-slate-700 transition-all font-medium"
        >
          {stxAddress ? `${stxAddress.slice(0, 5)}...${stxAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      {/* main dashboard */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 tracking-tight uppercase">Airdrop Panel</h2>
          
          <div className="space-y-6">
            {/* recipient input */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold font-mono">Addresses</label>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isValidCount ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {addressList.length} / 50
                </span>
              </div>
              <textarea
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-orange-500 outline-none font-mono text-sm transition-all"
                placeholder="Paste STX addresses here..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>

            {/* amount input */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 font-mono">STX Per Wallet</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 focus:border-orange-500 outline-none transition-all text-white font-medium shadow-inner"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">STX</span>
              </div>
            </div>

            {/* action button */}
            <button
              onClick={handleAirdrop}
              disabled={!isValidCount || isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30 shadow-lg shadow-orange-900/20"
            >
              {isSubmitting ? 'Processing...' : 'Execute Airdrop'}
            </button>
          </div>

          {/* tx success link */}
          {txId && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
              <p className="text-green-400 text-sm font-semibold mb-1 flex items-center gap-2">
                <span>✅</span> Broadcast Successful
              </p>
              <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 break-all underline decoration-slate-800 hover:text-slate-300">
                {txId}
              </a>
            </div>
          )}
        </div>

        {/* guidelines */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-500">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[11px] leading-relaxed font-mono">
            <strong className="text-slate-400 block mb-1 uppercase tracking-wider font-bold underline">Rules</strong>
            Requires 5-50 valid STX addresses per batch. This ensures the transaction fits within Stacks block limits.
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[11px] leading-relaxed font-mono">
            <strong className="text-slate-400 block mb-1 uppercase tracking-wider font-bold underline">Safety</strong>
            Only you can authorize the transfer of STX from your connected wallet. No private keys stored.
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;