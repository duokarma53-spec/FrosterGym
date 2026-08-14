import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Eye, EyeOff, ArrowRight, Lock, Mail, Dumbbell } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError) throw authError;
      navigate('/app');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Email or password is incorrect.');
      } else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError('Unable to connect. Please check your internet connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#B58A59]/30 selection:text-[#E8D1B5] px-4 sm:px-6">
      
      {/* Background Image & Cinematic Overlays */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}gym-bg.jpg)` }}
        />
        <div className="absolute inset-0 bg-black/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] z-0" />
        <div className="absolute inset-0 bg-[#B58A59]/[0.03] mix-blend-overlay z-0" />
        
        {/* Subtle radial light directly behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#EFE2C8]/[0.03] blur-[120px] pointer-events-none rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        
        {/* AUTHENTICATION CARD */}
        <div className={`w-full bg-[#0E0D0C]/80 backdrop-blur-xl border border-[#1A1816]/80 rounded-[40px] p-8 sm:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-700 delay-150 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          <div className="flex flex-col items-center mb-10">
            {/* Top Icon Badge with Glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#EFE2C8] blur-xl opacity-20 rounded-2xl"></div>
              <div className="w-[56px] h-[56px] bg-[#EFE2C8] rounded-[16px] flex items-center justify-center relative z-10 shadow-inner">
                <Dumbbell className="w-6 h-6 text-[#111111]" strokeWidth={2.5} />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-[28px] text-white tracking-wide mb-2 flex items-center gap-2">
              <span className="font-light">FROASTER</span><span className="font-bold">GYM</span>
            </h2>
            
            {/* Subtitle */}
            <p className="text-[9px] font-bold tracking-[0.25em] text-[#C2B59B] uppercase mb-4">
              Exclusive Access
            </p>
            
            {/* Fading line */}
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#EFE2C8]/20 to-transparent"></div>
          </div>

          {error && (
            <div className="mb-6 flex justify-center">
              <p className="text-[13px] text-red-400 font-light text-center bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.15em] text-[#888888] uppercase pl-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-[18px] w-[18px] text-[#555555]" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[54px] bg-[#121110] border border-[#22201D] rounded-[16px] pl-12 pr-4 text-[14px] text-[#F5F5F5] placeholder-[#444444] hover:border-[#33302C] focus:outline-none focus:border-[#EFE2C8]/40 focus:ring-1 focus:ring-[#EFE2C8]/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#121110] [&:-webkit-autofill]:[-webkit-text-fill-color:#F5F5F5]"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="password" className="block text-[10px] font-bold tracking-[0.15em] text-[#888888] uppercase pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-[18px] w-[18px] text-[#555555]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[54px] bg-[#121110] border border-[#22201D] rounded-[16px] pl-12 pr-12 text-[14px] text-[#F5F5F5] placeholder-[#444444] hover:border-[#33302C] focus:outline-none focus:border-[#EFE2C8]/40 focus:ring-1 focus:ring-[#EFE2C8]/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] tracking-widest font-mono [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#121110] [&:-webkit-autofill]:[-webkit-text-fill-color:#F5F5F5]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#555555] hover:text-[#A0A0A0] transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] group bg-[#EFE2C8] hover:bg-[#E0D0B0] text-[#0A0A0A] font-bold tracking-[0.2em] uppercase rounded-[16px] mt-8 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#EFE2C8]/5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="text-[12px] mt-0.5">SIGN IN</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Panel Bottom Status */}
          <div className="mt-12 text-center">
            <p className="text-[9px] text-[#555555] font-bold tracking-[0.2em] uppercase">
              Data is secured
            </p>
          </div>
        </div>

        {/* BOTTOM FOOTER PILL (Matches WOW Salon) */}
        <div className={`w-full mt-6 bg-[#0E0D0C]/80 backdrop-blur-md border border-[#1A1816]/80 rounded-[20px] px-6 py-4 flex flex-row items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#555555]" />
            <span className="text-[10px] text-[#777777] font-medium tracking-wide">© 2026 Froaster. All rights reserved.</span>
          </div>
          <span className="text-[10px] text-[#DDDDDD] font-bold tracking-wide">Powered by DuoKarma</span>
        </div>

      </div>
    </div>
  );
}
