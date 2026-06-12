'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Truck, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';

export default function WorkerLoginPage() {
  const [employeeId, setEmployeeId] = useState('');
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
      // Map Employee ID to internal email (e.g., EMP1234 -> emp1234@swachhtech.ai)
      // If the user literally types 'worker@swachhtech.ai', we'll allow it for testing
      const loginEmail = employeeId.includes('@') 
        ? employeeId 
        : `${employeeId.toLowerCase()}@swachhtech.ai`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      if (error) throw error;
      
      toast.success('Login successful! Redirecting to assignments...');
      login(); // Refresh auth context
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (error: any) {
      setErrorMessage('Invalid Employee ID or Password. Please contact your supervisor.');
      toast.error('Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background accents */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />

      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-50">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Truck className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Worker Portal</h1>
          <p className="text-slate-400 mt-2 font-medium">SWACHH TECH AI Operations</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Employee ID</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors uppercase"
                  placeholder="e.g. EMP1234"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">PIN / Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-500 text-sm">
            Need help? Contact dispatch or your supervisor.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
