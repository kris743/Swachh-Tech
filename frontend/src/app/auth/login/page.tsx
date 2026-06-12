'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Leaf, Loader2, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';

const ECO_FACTS = [
  "Recycling just one plastic bottle saves enough energy to run a laptop for 3 hours! 💻",
  "Your garbage is valuable! Segregate waste properly to earn Green Points and redeem them for cash. 💵",
  "Organic waste segregation helps produce rich compost for local organic farming. 🌾",
  "Clean India, wealthy pockets! Throw waste responsibly and fill your wallet. 🌍"
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  
  const router = useRouter();
  const { login } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % ECO_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      
      toast.success('Login successful!');
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
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 bg-emerald-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-emerald-600/40 via-emerald-900/80 to-background" />
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
          
          {/* Abstract Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-10"></div>
          
          {/* Floating leaf particles */}
          <>
            <motion.span 
              animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 45, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[15%] text-2xl opacity-30 select-none z-10"
            >
              🍃
            </motion.span>
            <motion.span 
              animate={{ y: [0, -20, 0], x: [0, -10, 0], rotate: [0, -30, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[25%] left-[25%] text-3xl opacity-20 select-none z-10"
            >
              🍃
            </motion.span>
            <motion.span 
              animate={{ y: [0, -12, 0], x: [0, 5, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-[45%] right-[20%] text-xl opacity-25 select-none z-10"
            >
              🍃
            </motion.span>
          </>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 max-w-lg text-white text-left"
        >
          <div className="p-4 backdrop-blur-xl rounded-2xl inline-flex items-center justify-center mb-8 border shadow-2xl bg-white/10 border-white/20 text-emerald-400">
            <Leaf className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h1 className="text-5xl font-black mb-6 leading-tight">
            Building smarter <br/>
            <span className="text-emerald-300">greener cities.</span>
          </h1>
          
          <div className="min-h-[90px] mb-10 flex items-center">
            <motion.div
              key={factIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="text-lg leading-relaxed font-bold text-emerald-100/90"
            >
              {ECO_FACTS[factIndex]}
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-900 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full opacity-70 bg-gradient-to-br from-emerald-400 to-blue-500"></div>
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-slate-300">
              Join active eco-citizens
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-24 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none lg:hidden" />
        
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
            <div className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/20">
              <Leaf className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="text-left mb-8">
            <h2 className="text-4xl font-black tracking-tight mb-3">
              Welcome Back
            </h2>
            <p className="text-muted-foreground font-medium text-base">
              Enter your credentials to access your citizen dashboard
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

          {/* OAuth for Citizens */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/dashboard`,
                    },
                  });
                  if (error) throw error;
                } catch (error: any) {
                  setErrorMessage(error.message || 'Error with Google login');
                  toast.error(error.message || 'Error with Google login');
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl font-semibold hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm text-foreground bg-background"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.37 10H12V14.26H17.92C17.67 15.63 16.86 16.8 15.68 17.58V20.34H19.24C21.32 18.42 22.56 15.58 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.24 20.34L15.68 17.58C14.72 18.22 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.15H2.21V16.99C4.01 20.57 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.88 14.15C5.66 13.51 5.54 12.77 5.54 12C5.54 11.23 5.66 10.49 5.88 9.85V7.01H2.21C1.47 8.49 1.04 10.18 1.04 12C1.04 13.82 1.47 15.51 2.21 16.99L5.88 14.15Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.32 3.91C17.45 2.16 14.96 1.04 12 1.04C7.7 1.04 4.01 3.43 2.21 7.01L5.88 9.85C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl font-semibold hover:bg-muted/50 transition-colors text-sm text-foreground bg-background">
              <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="relative flex items-center py-4 mb-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4 text-left">
              <div className="group relative">
                <label className="block text-xs font-bold mb-2 text-foreground/70 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-emerald-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-muted/30 pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm focus:border-emerald-500 focus:ring-emerald-500/10"
                    placeholder="citizen@swachhtech.ai"
                  />
                </div>
              </div>
              
              <div className="group relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-emerald-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-muted/30 pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm focus:border-emerald-500 focus:ring-emerald-500/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center mt-3 mb-6">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4.5 w-4.5 rounded border-border bg-muted/50 focus:ring-offset-background transition-colors cursor-pointer text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="remember-me" className="ml-3 block text-xs font-bold text-foreground/60 cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center rounded-xl px-4 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-4 transition-all shadow-xl hover:-translate-y-0.5 bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/20 shadow-emerald-500/15 hover:shadow-emerald-500/35"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <span className="text-muted-foreground font-semibold text-sm">
              Don't have an account? 
            </span>
            <Link href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors ml-1 text-sm">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}
