import React from 'react';
import { Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export interface PublicPreviewBannerProps {
  onLogin: () => void;
  onRegister: () => void;
  onDismiss?: () => void;
}

export default function PublicPreviewBanner({
  onLogin,
  onRegister,
  onDismiss
}: PublicPreviewBannerProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/30 text-white px-4 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md sticky top-0 z-40 backdrop-blur-md">
      
      {/* LEFT: PUBLIC PREVIEW TAG & REQUIRED BANNER TEXT */}
      <div className="flex items-center space-x-2 text-center sm:text-left">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>PREVIEW MODE</span>
        </span>
        <span className="font-medium text-slate-200">
          Start managing your tuition centre for free.
        </span>
      </div>

      {/* RIGHT: QUICK AUTHENTICATION BUTTONS & DISMISS */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={onLogin}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={onRegister}
          className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-1 transition-all cursor-pointer"
        >
          <span>Create Free Account</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
