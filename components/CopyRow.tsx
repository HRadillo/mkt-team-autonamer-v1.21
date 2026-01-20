import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyRowProps {
  label: string;
  value: string;
  isPrimary?: boolean;
}

export const CopyRow: React.FC<CopyRowProps> = ({ label, value, isPrimary = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = value ? value.length : 0;

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center justify-between">
        <span className={`text-xs uppercase tracking-wider font-bold ${isPrimary ? 'text-[#ffff99]' : 'text-zinc-500'}`}>
          {label}
        </span>
        {copied && <span className="text-[10px] text-green-400 font-medium animate-pulse">COPIED TO CLIPBOARD</span>}
      </div>
      
      <div className="relative group">
        <div className={`
          w-full min-h-[50px] bg-zinc-900/50 rounded-lg border border-zinc-800 
          p-3 pr-24 text-sm font-mono break-all leading-relaxed transition-all duration-300
          group-hover:border-zinc-600 group-hover:shadow-[0_0_15px_rgba(255,255,153,0.1)]
          ${!value ? 'text-zinc-600 italic' : 'text-zinc-200'}
        `}>
          {value || 'Waiting for input...'}
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-3">
          {value && (
            <span className="text-[10px] text-zinc-600 font-mono hidden sm:block">
              {charCount} chars
            </span>
          )}
          
          <button
            onClick={handleCopy}
            disabled={!value}
            className={`
              p-2 rounded-md transition-all duration-200 flex items-center justify-center
              ${!value ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-[#ffff99] hover:text-black text-[#ffff99] hover:shadow-[0_0_15px_rgba(255,255,153,0.6)]'}
              ${copied ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''}
            `}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};