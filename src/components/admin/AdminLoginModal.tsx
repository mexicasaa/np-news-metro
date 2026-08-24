import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, ShieldCheck, ArrowRight, X, AlertCircle } from 'lucide-react';
import { signInWithCredentials } from '../../services/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      const { profile, error: authError } = await signInWithCredentials(cleanUser, cleanPass);

      if (authError || !profile) {
        // Check fallback for local admin credential
        if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'umang1512') {
          try {
            localStorage.setItem('np_news_admin_auth', 'true');
            sessionStorage.setItem('np_news_admin_auth', 'true');
          } catch (e) {}
          setIsSubmitting(false);
          onSuccess();
          return;
        }

        setIsSubmitting(false);
        setError(authError || 'Invalid username or password. Please verify your credentials.');
        return;
      }

      try {
        localStorage.setItem('np_news_admin_auth', 'true');
        sessionStorage.setItem('np_news_admin_auth', 'true');
      } catch (e) {}
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Authentication error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Header Accent Gradient */}
        <div className="h-1.5 bg-gradient-to-r from-[#162839] via-[#BA1A1A] to-[#C5A059]"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7 sm:p-8">
          
          {/* Brand Icon & Heading */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#162839]/10 text-[#162839] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#162839]/20 shadow-xs">
              <ShieldCheck className="w-7 h-7 text-[#162839]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#162839] tracking-tight">
              Newsroom Staff Login
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              NP News Metro • Editorial Management Suite
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-[#BA1A1A] animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin or admin@npnewsmetro.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#162839] focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#162839] focus:outline-hidden transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#162839] hover:bg-[#2C3E50] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Editorial Access Control (Supabase Auth)</span>
          </div>

        </div>
      </div>
    </div>
  );
};
