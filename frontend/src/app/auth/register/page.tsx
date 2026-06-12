'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Leaf, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const supabase = createClient();

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
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-50">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 glass rounded-2xl p-8 shadow-2xl border border-border"
      >
        <div className="text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the Next-Gen Waste Management platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Arjun"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Sharma"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="citizen@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="CITIZEN" className="bg-background">Citizen</option>
                <option value="WORKER" className="bg-background">Waste Worker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm border-t border-border pt-6">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


