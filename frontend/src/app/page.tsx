'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, Leaf, BarChart3, Users, Zap, Recycle, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className="w-full flex items-center justify-between p-6 max-w-7xl mx-auto z-20 relative glass-nav rounded-b-3xl mb-4 shadow-sm border-b border-border/50 backdrop-blur-xl bg-background/60">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
            <Leaf className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700 dark:to-emerald-400">
            SwachhTech
          </span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link href="/worker/login" className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors border border-orange-500/30 px-3 py-1.5 rounded-lg bg-orange-500/10">
            Worker Portal
          </Link>
          <Link href="/auth/login" className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors px-3 py-1.5">
            Citizen Portal
          </Link>
          <Link href="/auth/login" className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-500/10">
            Municipal HQ
          </Link>
          <Link href="/auth/register" className="text-sm font-semibold bg-emerald-500 text-white px-6 py-2.5 rounded-full hover:bg-emerald-600 transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 pt-16 md:pt-24 pb-12">
        <motion.div 
          className="max-w-5xl mx-auto space-y-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Next-Gen Smart Waste Management
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05]">
            A Cleaner Future, <br className="hidden md:block"/> 
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 blur-2xl opacity-20 dark:opacity-40 rounded-full"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500">
                Powered by AI.
              </span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            Transforming cities with intelligent route optimization, gamified citizen engagement, and predictive waste analytics.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
            <Link href="/auth/register" className="group w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-full bg-emerald-500 px-10 text-lg font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:shadow-emerald-500/40">
              Start Contributing <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="group w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-full border-2 border-border bg-background/50 backdrop-blur-sm px-10 text-lg font-bold shadow-sm transition-all hover:bg-muted hover:border-emerald-500/30">
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Impact Stats Marquee/Section */}
      <section className="w-full border-y border-border/50 bg-muted/30 backdrop-blur-md py-8 z-10 my-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-foreground">1.2M+</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Tons Recycled</span>
          </div>
          <div className="w-px h-12 bg-border hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-foreground">50k+</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Active Citizens</span>
          </div>
          <div className="w-px h-12 bg-border hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-foreground">30%</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Fuel Saved</span>
          </div>
          <div className="w-px h-12 bg-border hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-foreground">100+</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Smart Cities</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-7xl mx-auto w-full p-6 pb-32 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Enterprise-Grade Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to manage city-wide waste operations efficiently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="group rounded-[2rem] border border-border/50 bg-gradient-to-b from-background to-muted/20 p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 relative z-10">
              <Zap className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground relative z-10">Smart Routing</h3>
            <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">
              AI-powered optimization algorithms that guide collection trucks through the most efficient paths, saving fuel and time.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="group rounded-[2rem] border border-border/50 bg-gradient-to-b from-background to-muted/20 p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 relative z-10">
              <Users className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground relative z-10">Citizen Gamification</h3>
            <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">
              Engaging experiences that reward households with Green Points, badges, and top spots on the city leaderboard.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="group rounded-[2rem] border border-border/50 bg-gradient-to-b from-background to-muted/20 p-8 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20 relative z-10">
              <BarChart3 className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground relative z-10">Predictive Analytics</h3>
            <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">
              Comprehensive dashboards predicting waste generation trends, managing complaints, and monitoring performance.
            </p>
          </motion.div>
        </div>
      </section>
      
    </main>
  );
}
