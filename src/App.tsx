import { useState, useMemo } from 'react';
import './reownConfig'; 
import { openContractCall } from '@stacks/connect';
// Import the constant instead of the class
import { STACKS_MAINNET } from '@stacks/network'; 
import { uintCV, listCV, principalCV } from '@stacks/transactions';

const CONTRACT_ADDRESS = 'SP32YN03PMDGXQA9HYEZS2WBAT32AZKDJTBAPF4T';
const CONTRACT_NAME = 'stx-multi-send';

function App() {
  const [addressInput, setAddressInput] = useState('');
  const [amount, setAmount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState('');

  const addressList = useMemo(() => {
    return addressInput
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.startsWith('SP'));
  }, [addressInput]);

  const isValidCount = addressList.length >= 5 && addressList.length <= 50;

  const handleAirdrop = async () => {
    if (!isValidCount) {
      alert("Please provide between 5 and 50 valid Stacks addresses.");
      return;
    }

    setIsSubmitting(true);

    try {
      await openContractCall({
        // Use the constant here
        network: STACKS_MAINNET, 
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'airdrop-stx',
        functionArgs: [
          listCV(addressList.map(addr => principalCV(addr))),
          uintCV(Math.floor(amount * 1000000)) 
        ],
        onFinish: (data: any) => {
          setTxId(data.txId);
          setIsSubmitting(false);
          setAddressInput('');
        },
        onCancel: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error("Airdrop failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-xl italic">S</div>
            <h1 className="text-xl font-bold tracking-tight">STX<span className="text-orange-500">Airdrop</span></h1>
          </div>
          <appkit-button /> 
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">Multi-Send STX</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-medium text-slate-400">Recipient Addresses</label>
              <span className={`text-xs font-mono px-2 py-1 rounded ${isValidCount ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                Count: {addressList.length} / 50
              </span>
            </div>
            <textarea
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-mono text-sm"
              placeholder="Paste addresses (one per line)..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-400 mb-2">Amount per Wallet (STX)</label>
            <div className="relative">
              <input
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 text-slate-200 focus:border-orange-500 outline-none transition-all"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">STX</span>
            </div>
          </div>

          <button
            onClick={handleAirdrop}
            disabled={!isValidCount || isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30 shadow-lg shadow-orange-900/10"
          >
            {isSubmitting ? 'Check Wallet...' : 'Launch Airdrop'}
          </button>

          {txId && (
            <div className="mt-8 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-sm font-semibold mb-1 flex items-center gap-2">
                <span>✅</span> Broadcasted Successfuly
              </p>
              <a 
                href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-500 hover:text-orange-400 break-all uppercase tracking-widest transition-colors"
              >
                {txId}
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-500">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[11px]">
            <strong className="text-slate-400 block mb-1 uppercase tracking-wider">Protocol Rules</strong>
            Min 5 & Max 50 addresses per batch. This ensures the transaction fits within Stacks block limits.
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[11px]">
            <strong className="text-slate-400 block mb-1 uppercase tracking-wider">Security</strong>
            Only you can authorize the transfer of STX from your connected wallet.
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;