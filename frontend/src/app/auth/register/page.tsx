'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Leaf, Loader2, ArrowLeft, Mail, Lock, User, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const REGISTER_MOTIVATIONS = [
  "Earn cash rewards directly into your UPI account for segregating trash! 💵",
  "Pay your monthly electricity and water bills using Green Points. ⚡💧",
  "Get exclusive shopping vouchers at local grocery stores. 🛍️",
  "Sort waste properly, keep India clean, and fill your pockets! 🌍"
];

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [isLoading, setIsLoading] = useState(false);
  const [motivationIndex, setMotivationIndex] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex((prev) => (prev + 1) % REGISTER_MOTIVATIONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Register User with Supabase and pass metadata for our NestJS backend
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });
      
      if (error) throw error;
      
      // Even if session is returned, we force them to login manually
      await supabase.auth.signOut();
      toast.success('Registration successful! Please login to continue.');
      
      setTimeout(() => {
        if (role === 'WORKER') {
          router.push('/worker/login');
        } else {
          router.push('/auth/login');
        }
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message || 'Error registering user.');
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
            <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
          </div>
          
          <h1 className="text-5xl font-black mb-6 leading-tight">
            Join the Eco-Wealth <br/>
            <span className="text-emerald-300">Revolution. 🌿</span>
          </h1>
          
          <div className="min-h-[90px] mb-10 flex items-center">
            <motion.div
              key={motivationIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="text-lg leading-relaxed font-bold text-emerald-100/90"
            >
              {REGISTER_MOTIVATIONS[motivationIndex]}
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
              Clean India, Wealthy Pockets
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-20 relative overflow-y-auto">
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
          className="w-full max-w-md relative z-10 my-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/20">
              <Leaf className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="text-left mb-6">
            <h2 className="text-4xl font-black tracking-tight mb-2">
              Get Started
            </h2>
            <p className="text-muted-foreground font-medium text-sm">
              Create your account to start sorting waste and earning rewards
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            
            {/* Interactive Role Switcher Cards */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CITIZEN')}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                    role === 'CITIZEN'
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-border bg-background hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <Leaf className={`w-5 h-5 ${role === 'CITIZEN' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    {role === 'CITIZEN' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </div>
                  <span className="text-sm font-black">Citizen</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-1 leading-tight">Sort waste at home and collect points/cash.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('WORKER')}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                    role === 'WORKER'
                      ? 'border-orange-500 bg-orange-500/5 text-orange-500 ring-2 ring-orange-500/20'
                      : 'border-border bg-background hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <Truck className={`w-5 h-5 ${role === 'WORKER' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    {role === 'WORKER' && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                  </div>
                  <span className="text-sm font-black">Worker</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-1 leading-tight">Scan codes and collect waste in the field.</span>
                </button>
              </div>
            </div>

            {/* Inputs Group */}
            <div className="space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="group relative">
                  <label className="block text-[10px] font-bold mb-1.5 text-foreground/70 uppercase tracking-wider">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-4.5 w-4.5 text-muted-foreground transition-colors ${role === 'CITIZEN' ? 'group-focus-within:text-emerald-500' : 'group-focus-within:text-orange-500'}`} />
                    </div>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`block w-full rounded-xl border border-border bg-muted/30 pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm ${role === 'CITIZEN' ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-orange-500 focus:ring-orange-500/10'}`}
                      placeholder="Arjun"
                    />
                  </div>
                </div>
                
                <div className="group relative">
                  <label className="block text-[10px] font-bold mb-1.5 text-foreground/70 uppercase tracking-wider">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-4.5 w-4.5 text-muted-foreground transition-colors ${role === 'CITIZEN' ? 'group-focus-within:text-emerald-500' : 'group-focus-within:text-orange-500'}`} />
                    </div>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`block w-full rounded-xl border border-border bg-muted/30 pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm ${role === 'CITIZEN' ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-orange-500 focus:ring-orange-500/10'}`}
                      placeholder="Sharma"
                    />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] font-bold mb-1.5 text-foreground/70 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className={`h-4.5 w-4.5 text-muted-foreground transition-colors ${role === 'CITIZEN' ? 'group-focus-within:text-emerald-500' : 'group-focus-within:text-orange-500'}`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full rounded-xl border border-border bg-muted/30 pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm ${role === 'CITIZEN' ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-orange-500 focus:ring-orange-500/10'}`}
                    placeholder="example@swachhtech.ai"
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] font-bold mb-1.5 text-foreground/70 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-4.5 w-4.5 text-muted-foreground transition-colors ${role === 'CITIZEN' ? 'group-focus-within:text-emerald-500' : 'group-focus-within:text-orange-500'}`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-xl border border-border bg-muted/30 pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-4 transition-all font-medium text-sm ${role === 'CITIZEN' ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-orange-500 focus:ring-orange-500/10'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`group relative flex w-full justify-center items-center rounded-xl px-4 py-3 text-base font-bold text-white focus:outline-none focus:ring-4 transition-all shadow-xl hover:-translate-y-0.5 mt-6 ${
                role === 'CITIZEN' 
                  ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/20 shadow-emerald-500/15 hover:shadow-emerald-500/35' 
                  : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20 shadow-orange-500/15 hover:shadow-orange-500/35'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <span className="text-muted-foreground font-semibold text-sm">
              Already have an account? 
            </span>
            <Link 
              href="/auth/login" 
              className={`font-bold ml-1 text-sm transition-colors ${role === 'CITIZEN' ? 'text-emerald-600 hover:text-emerald-500' : 'text-orange-500 hover:text-orange-400'}`}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}
