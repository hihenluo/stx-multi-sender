import { useState, useMemo, useEffect } from 'react';
import { connect, isConnected, disconnect, getLocalStorage, request } from '@stacks/connect';
import { uintCV, listCV, principalCV, contractPrincipalCV } from '@stacks/transactions';

// Smart Contract Constants
const STX_MS_CONTRACT = 'SP32YN03PMDGXQA9HYEZS2WBAT32AZKDJTBAPF4T.stx-multi-send';
const TOKEN_MS_CONTRACT = 'SP32YN03PMDGXQA9HYEZS2WBAT32AZKDJTBAPF4T.sip-multi-send';

function App() {
  const [activeTab, setActiveTab] = useState<'stx' | 'sip10'>('stx');
  const [addressInput, setAddressInput] = useState('');
  const [tokenContractInput, setTokenContractInput] = useState(''); // Format: SP...contract-name
  const [amount, setAmount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState('');
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  // Sync authentication state on component mount
  useEffect(() => {
    if (isConnected()) {
      const userData = getLocalStorage() as any;
      const addr = userData?.addresses?.stx?.[0]?.address || 
                   userData?.addresses?.find?.((a: any) => a.symbol === 'STX')?.address;
      if (addr) setStxAddress(addr);
    }
  }, []);

  // Toggle between Wallet Connect and Disconnect
  const handleConnect = async () => {
    try {
      if (isConnected()) {
        disconnect();
        setStxAddress(null);
        return;
      }
      const response = await connect() as any;
      const addr = response?.addresses?.stx?.[0]?.address || 
                   response?.addresses?.find?.((a: any) => a.symbol === 'STX')?.address;
      if (addr) setStxAddress(addr);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // Extract valid Stacks addresses from textarea
  const addressList = useMemo(() => {
    return addressInput
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.startsWith('SP'));
  }, [addressInput]);

  const isValidCount = addressList.length >= 5 && addressList.length <= 50;

  // Primary execution logic for both STX and Tokens
  const handleExecute = async () => {
    if (!isValidCount) return;
    if (!isConnected()) {
      await handleConnect();
      return;
    }

    setIsSubmitting(true);
    try {
      let contractCallParams: any;

      if (activeTab === 'stx') {
        // Native STX Multi-send logic
        const [msAddr, msName] = STX_MS_CONTRACT.split('.');
        contractCallParams = {
          contract: `${msAddr}.${msName}`,
          functionName: 'airdrop-stx',
          functionArgs: [
            listCV(addressList.map(addr => principalCV(addr))),
            uintCV(Math.floor(amount * 1000000)) // 6 decimals
          ]
        };
      } else {
        // SIP-10 Token Multi-send logic
        if (!tokenContractInput.includes('.')) {
          alert("Please enter a valid Token Contract (e.g., SP...token-name)");
          setIsSubmitting(false);
          return;
        }
        const [tokenAddr, tokenName] = tokenContractInput.split('.');
        const [msAddr, msName] = TOKEN_MS_CONTRACT.split('.');
        
        contractCallParams = {
          contract: `${msAddr}.${msName}`,
          functionName: 'airdrop-token',
          functionArgs: [
            contractPrincipalCV(tokenAddr, tokenName), // The token trait
            listCV(addressList.map(addr => principalCV(addr))),
            uintCV(amount) // Note: decimals depend on the token itself
          ]
        };
      }

      const response: any = await request('stx_callContract', {
        ...contractCallParams,
        network: 'mainnet',
        postConditionMode: 'allow',
      });

      if (response?.txid) {
        setTxId(response.txid);
        setAddressInput('');
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("Execution failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500/30">
      
      {/* Navigation bar */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 bg-slate-950/90 backdrop-blur-sm z-50 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold italic shadow-lg">S</div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">STX<span className="text-orange-500">Airdrop</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="https://github.com/hihenluo/stx-multi-sender.git" target="_blank" rel="noreferrer" className="hidden md:block text-xs font-semibold text-slate-400 hover:text-white transition-colors">Github</a>
          <a href="https://github.com/hihenluo/stx-multi-sender/tree/main/contract" target="_blank" rel="noreferrer" className="hidden md:block text-xs font-semibold text-slate-400 hover:text-white transition-colors">Contract</a>
          <button 
            onClick={handleConnect}
            className="bg-slate-800 hover:bg-slate-700 text-sm py-2 px-6 rounded-full border border-slate-700 transition-all font-medium text-white shadow-md"
          >
            {stxAddress ? `${stxAddress.slice(0, 5)}...${stxAddress.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit mx-auto md:mx-0 shadow-xl">
          <button 
            onClick={() => {setActiveTab('stx'); setTxId('');}} 
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'stx' ? 'bg-orange-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}
          >
            STX
          </button>
          <button 
            onClick={() => {setActiveTab('sip10'); setTxId('');}} 
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'sip10' ? 'bg-orange-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}
          >
            SIP-10
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-left">
          <h2 className="text-2xl font-semibold mb-6 tracking-tight uppercase">
            {activeTab === 'stx' ? 'Native STX' : 'Token'} Airdrop Panel
          </h2>
          
          <div className="space-y-6">
            {/* Token Contract Input (Visible only on SIP-10 tab) */}
            {activeTab === 'sip10' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 font-mono">Token Contract Address</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 focus:border-orange-500 outline-none transition-all text-white font-medium"
                  placeholder="SP3K...alex-token"
                  value={tokenContractInput}
                  onChange={(e) => setTokenContractInput(e.target.value)}
                />
              </div>
            )}

            {/* Recipient list textarea */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold font-mono">Recipients</label>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isValidCount ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {addressList.length} / 50
                </span>
              </div>
              <textarea
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-orange-500 outline-none font-mono text-sm transition-all shadow-inner"
                placeholder="Paste STX addresses here (one per line)..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 font-mono text-left">
                Amount per Wallet ({activeTab === 'stx' ? 'STX' : 'Token Units'})
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 focus:border-orange-500 outline-none transition-all text-white font-medium"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono tracking-tighter">
                  {activeTab === 'stx' ? 'STX' : 'TKN'}
                </span>
              </div>
            </div>

            {/* Execute button */}
            <button
              onClick={handleExecute}
              disabled={!isValidCount || isSubmitting || (activeTab === 'sip10' && !tokenContractInput)}
              className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30 shadow-lg shadow-orange-900/20 text-white"
            >
              {isSubmitting ? 'Confirm in Wallet...' : 'Launch Airdrop'}
            </button>
          </div>

          {/* Success link */}
          {txId && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-in fade-in">
              <p className="text-green-400 text-sm font-semibold mb-1 flex items-center gap-2">
                <span>✅</span> Broadcast Successful
              </p>
              <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 break-all underline decoration-slate-800 hover:text-slate-300 transition-colors">
                {txId}
              </a>
            </div>
          )}
        </div>

        {/* Informational Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-500">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[11px] leading-relaxed font-mono text-left">
            <strong className="text-slate-400 block mb-1 uppercase tracking-wider font-bold underline">Protocol Rules</strong>
            Requires 5-50 valid STX addresses per batch. This ensures the transaction fits within Stacks block limits.
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[11px] leading-relaxed font-mono text-left">
            <strong className="text-slate-400 block mb-1 uppercase tracking-wider font-bold underline">Safety Guard</strong>
            Secured by Stacks Post-Conditions. Assets only move with your explicit signature. Only you can authorize the transfer of STX from your connected wallet. No private keys stored.
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;