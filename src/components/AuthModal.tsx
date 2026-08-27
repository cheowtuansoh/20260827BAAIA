import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('trader@tradescope.io');
  const [name, setName] = useState('Alex Morgan');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E0E3EB] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6A6D78] hover:text-[#131722]"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0049DB] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="material-symbols-outlined text-[26px]">candlestick_chart</span>
          </div>
          <h2 className="text-xl font-bold text-[#131722]">
            {mode === 'LOGIN' ? 'Welcome to TradeScope' : 'Create TradeScope Account'}
          </h2>
          <p className="text-xs text-[#6A6D78] mt-1">
            Access synchronized cross-device watchlists, paper accounts, and custom alert streams.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#089981] mb-2">check_circle</span>
            <p className="text-sm font-bold text-[#131722]">Authenticated Successfully!</p>
            <p className="text-xs text-[#6A6D78] mt-1">Synchronizing market state...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="text-xs font-semibold text-[#131722] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#F7F9FF] border border-[#E0E3EB] rounded-xl outline-none focus:border-[#0049DB]"
                  placeholder="Your Name"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#131722] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#F7F9FF] border border-[#E0E3EB] rounded-xl outline-none focus:border-[#0049DB]"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#131722] block mb-1">Password</label>
              <input
                type="password"
                required
                defaultValue="password123"
                className="w-full px-3.5 py-2 text-sm bg-[#F7F9FF] border border-[#E0E3EB] rounded-xl outline-none focus:border-[#0049DB]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0049DB] hover:bg-[#003AB3] text-white rounded-xl font-bold text-sm shadow-xs transition-transform active:scale-98"
            >
              {mode === 'LOGIN' ? 'Sign In / Instant Paper Demo' : 'Create Free Account'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="text-xs text-[#0049DB] hover:underline font-semibold"
              >
                {mode === 'LOGIN' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
