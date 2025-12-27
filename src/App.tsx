import { useState, useMemo } from 'react';
import { showConnect, openContractCall } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network'; 
import { uintCV, listCV, principalCV } from '@stacks/transactions';

const CONTRACT_ADDRESS = 'SP32YN03PMDGXQA9HYEZS2WBAT32AZKDJTBAPF4T';
const CONTRACT_NAME = 'stx-multi-send';

function App() {
  const [addressInput, setAddressInput] = useState('');
  const [amount, setAmount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState('');
  const [userData, setUserData] = useState<any>(null);

  // wallet connection logic
  const authenticate = () => {
    showConnect({
      appDetails: {
        name: 'STX Airdrop',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (payload) => {
        setUserData(payload.userSession.loadUserData());
      },
    });
  };

  const addressList = useMemo(() => {
    return addressInput
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.startsWith('SP'));
  }, [addressInput]);

  const isValidCount = addressList.length >= 5 && addressList.length <= 50;

  // contract call logic
  const handleAirdrop = async () => {
    if (!isValidCount) return;
    setIsSubmitting(true);

    try {
      await openContractCall({
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
        onCancel: () => setIsSubmitting(false),
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* navigation & connect button */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 bg-slate-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold italic">S</div>
          <h1 className="text-xl font-bold tracking-tight">STX<span className="text-orange-500">Airdrop</span></h1>
        </div>
        
        <button 
          onClick={authenticate}
          className="bg-slate-800 hover:bg-slate-700 text-sm py-2 px-6 rounded-full border border-slate-700 transition-all font-medium"
        >
          {userData ? `${userData.profile.stxAddress.mainnet.slice(0, 5)}...${userData.profile.stxAddress.mainnet.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      {/* card page content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">Airdrop Dashboard</h2>
          
          <div className="space-y-6">
            {/* input address */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-widest">Addresses</label>
                <span className={`text-xs font-mono ${isValidCount ? 'text-green-400' : 'text-red-400'}`}>
                  {addressList.length} / 50
                </span>
              </div>
              <textarea
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-orange-500 outline-none font-mono text-sm transition-all"
                placeholder="SP1...\nSP2..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>

            {/* input amount */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Amount (STX)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 focus:border-orange-500 outline-none transition-all"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">STX</span>
              </div>
            </div>

            {/* action button */}
            <button
              onClick={handleAirdrop}
              disabled={!isValidCount || isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30"
            >
              {isSubmitting ? 'Pending Wallet...' : 'Execute Airdrop'}
            </button>
          </div>

          {/* status notification */}
          {txId && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-sm font-semibold mb-1">Transaction Broadcasted</p>
              <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 break-all underline">
                View on Explorer
              </a>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

export default App;