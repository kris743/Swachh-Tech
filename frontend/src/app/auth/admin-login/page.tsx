'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Loader2, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const { login } = useAuth();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast.success('Admin authentication successful!');
      login(); // The AuthContext will now automatically fetch user profile
      
      // Allow context to fetch user before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Invalid credentials or server error.');
      toast.error(error.message || 'Invalid credentials or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 bg-slate-950 border-r border-blue-900/20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-950/80 via-slate-950 to-background" />
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/15 blur-[120px] pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
          
          {/* Abstract Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-10"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 max-w-lg text-white text-left"
        >
          <div className="p-4 backdrop-blur-xl rounded-2xl inline-flex items-center justify-center mb-8 border shadow-2xl bg-blue-500/10 border-blue-500/20 text-blue-400">
            <Shield className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          
          <h1 className="text-5xl font-black mb-6 leading-tight">
            SwachhTech HQ <br/>
            <span className="text-blue-400">Control Center.</span>
          </h1>
          
          <p className="text-lg mb-10 leading-relaxed font-medium text-slate-300">
            Access central command unit. Monitor real-time waste analytics, manage field staff schedules, audit compliance, and grant system permissions.
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full opacity-70 bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-slate-300">
              Secured Municipal HQ Access
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-24 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none lg:hidden" />
        
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-50">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="p-3 rounded-2xl border bg-blue-500/10 border-blue-500/20">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="text-left mb-8">
            <h2 className="text-4xl font-black tracking-tight mb-3">
              HQ Access
            </h2>
            <p className="text-muted-foreground font-medium text-base">
              Enter credentials to access Admin Control Room
            </p>
          </div>
          
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {errorMessage}
            </motion.div>
          )}

          <div className="mb-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-400 text-xs font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0 text-blue-400 animate-pulse" />
            <span>Enterprise Secure Vault Mode enabled. Single Sign-On (SSO) bypassed.</span>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4 text-left">
              <div className="group relative">
                <label className="block text-xs font-bold mb-2 text-foreground/70 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-muted/30 pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm focus:border-blue-500 focus:ring-blue-500/10"
                    placeholder="admin@swachhtech.ai"
                  />
                </div>
              </div>
              
              <div className="group relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-muted/30 pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm focus:border-blue-500 focus:ring-blue-500/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center mt-3 mb-6">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4.5 w-4.5 rounded border-border bg-muted/50 focus:ring-offset-background transition-colors cursor-pointer text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-3 block text-xs font-bold text-foreground/60 cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center rounded-xl px-4 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-4 transition-all shadow-xl hover:-translate-y-0.5 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20 shadow-blue-500/15 hover:shadow-blue-500/35"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Access Control HQ
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <span className="text-muted-foreground font-semibold text-sm">
              Unauthorized access is logged.
            </span>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}
