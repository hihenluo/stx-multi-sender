export function InfoGrid() {
  return (
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
  );
}