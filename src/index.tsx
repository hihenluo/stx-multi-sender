import { useState, useMemo } from 'react';
import { request } from '@stacks/connect';
import { uintCV, listCV, principalCV, contractPrincipalCV } from '@stacks/transactions';
import { STX_MS_CONTRACT, TOKEN_MS_CONTRACT } from './constants/contracts';
import { useStacksAuth } from './hooks/useStacksAuth';
import { InfoGrid } from './components/InfoGrid';

function App() {
  const { stxAddress, handleConnect, isConnected } = useStacksAuth();
  const [activeTab, setActiveTab] = useState<'stx' | 'sip10'>('stx');
  const [addressInput, setAddressInput] = useState('');
  const [tokenContractInput, setTokenContractInput] = useState('');
  const [amount, setAmount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState('');

  const addressList = useMemo(() => {
    return addressInput.split('\n').map(a => a.trim()).filter(a => a.startsWith('SP'));
  }, [addressInput]);

  const isValidCount = addressList.length >= 5 && addressList.length <= 50;

  const handleExecute = async () => {
    if (!isValidCount) return;
    if (!isConnected) { await handleConnect(); return; }

    setIsSubmitting(true);
    try {
      let params: any;
      if (activeTab === 'stx') {
        const [addr, name] = STX_MS_CONTRACT.split('.');
        params = {
          contract: `${addr}.${name}`,
          functionName: 'airdrop-stx',
          functionArgs: [listCV(addressList.map(a => principalCV(a))), uintCV(Math.floor(amount * 1000000))]
        };
      } else {
        const [tAddr, tName] = tokenContractInput.split('.');
        const [msAddr, msName] = TOKEN_MS_CONTRACT.split('.');
        params = {
          contract: `${msAddr}.${msName}`,
          functionName: 'airdrop-token',
          functionArgs: [contractPrincipalCV(tAddr, tName), listCV(addressList.map(a => principalCV(a))), uintCV(amount)]
        };
      }

      const response: any = await request('stx_callContract', { ...params, network: 'mainnet', postConditionMode: 'allow' });
      if (response?.txid) { setTxId(response.txid); setAddressInput(''); }
      setIsSubmitting(false);
    } catch (e) { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500/30">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 bg-slate-950/90 backdrop-blur-sm z-50 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold italic shadow-lg">S</div>
          <h1 className="text-xl font-bold tracking-tight uppercase">STX<span className="text-orange-500">Airdrop</span></h1>
        </div>
        <button onClick={handleConnect} className="bg-slate-800 hover:bg-slate-700 text-sm py-2 px-6 rounded-full border border-slate-700 transition-all font-medium">
          {stxAddress ? `${stxAddress.slice(0, 5)}...${stxAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* TAB SWITCHER */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit mx-auto md:mx-0 shadow-xl">
          <button onClick={() => {setActiveTab('stx'); setTxId('');}} className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'stx' ? 'bg-orange-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}>STX</button>
          <button onClick={() => {setActiveTab('sip10'); setTxId('');}} className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'sip10' ? 'bg-orange-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}>SIP-10</button>
        </div>

        {/* MAIN FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-left">
          <h2 className="text-2xl font-semibold mb-6 tracking-tight uppercase">{activeTab === 'stx' ? 'Native STX' : 'Token'} Airdrop Panel</h2>
          <div className="space-y-6">
            {activeTab === 'sip10' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 font-mono">Token Contract Address</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 focus:border-orange-500 outline-none text-white font-medium" placeholder="SP3K...alex-token" value={tokenContractInput} onChange={(e) => setTokenContractInput(e.target.value)} />
              </div>
            )}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold font-mono">Recipients</label>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isValidCount ? 'text-green-400' : 'text-red-400'}`}>{addressList.length} / 50</span>
              </div>
              <textarea className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-orange-500 outline-none font-mono text-sm transition-all" placeholder="Paste addresses here..." value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 font-mono">Amount per Wallet</label>
              <div className="relative">
                <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 focus:border-orange-500 outline-none text-white font-medium" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">{activeTab === 'stx' ? 'STX' : 'TKN'}</span>
              </div>
            </div>
            <button onClick={handleExecute} disabled={!isValidCount || isSubmitting} className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30 text-white">
              {isSubmitting ? 'Confirm in Wallet...' : 'Launch Airdrop'}
            </button>
          </div>
          {txId && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-sm font-semibold mb-1">✅ Broadcast Successful</p>
              <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" className="text-[10px] text-slate-500 break-all underline hover:text-slate-300">{txId}</a>
            </div>
          )}
        </div>

        <InfoGrid />
      </main>
    </div>
  );
}

export default App;