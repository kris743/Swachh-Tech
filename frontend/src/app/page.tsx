'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, Leaf, BarChart3, Users, Zap, Recycle, ShieldCheck, TrendingUp, Sparkles, TreePine } from 'lucide-react';

const WASTE_TYPES = [
  { id: 'plastic', label: 'Plastic', icon: '🥤', pointsPerKg: 10, co2PerKg: 1.5, landfillPerKg: 3.2 },
  { id: 'paper', label: 'Paper', icon: '📰', pointsPerKg: 8, co2PerKg: 0.9, landfillPerKg: 1.8 },
  { id: 'organic', label: 'Organic', icon: '🍌', pointsPerKg: 5, co2PerKg: 0.5, landfillPerKg: 0.5 },
  { id: 'ewaste', label: 'E-Waste', icon: '💻', pointsPerKg: 25, co2PerKg: 4.2, landfillPerKg: 5.0 },
];

export default function Home() {
  const [selectedWaste, setSelectedWaste] = useState(WASTE_TYPES[0]);
  const [weight, setWeight] = useState(10);

  const points = Math.round(weight * selectedWaste.pointsPerKg);
  const co2 = (weight * selectedWaste.co2PerKg).toFixed(1);
  const landfill = (weight * selectedWaste.landfillPerKg).toFixed(1);
  const treesEquivalent = (weight * selectedWaste.co2PerKg * 0.05).toFixed(2);

  const floatVariants = (delay = 0) => ({
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
        delay
      }
    }
  });

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
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors"
          >
            <Leaf className="w-6 h-6 text-emerald-500" />
          </motion.div>
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
          <Link href="/auth/admin-login" className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-500/10">
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
              Start Contributing & Earn Cash <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>      {/* Interactive Eco-Impact Calculator Section */}
      <section className="max-w-6xl mx-auto w-full px-6 py-12 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Engaging Copy (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Eco-Wealth Loop
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              The Garbage-to-Gold <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500">
                Revolution is Here. 💰
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Why throw away money? Every bottle, paper, or electronic item you segregate is a potential asset. SwachhTech converts your daily sorted waste directly into **Green Points** in your wallet.
            </p>
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl">
              <p className="text-sm font-bold text-foreground italic">
                "Desh bhi saaf, aur pocket bhi garam! Clean India, Wealthy Pockets."
              </p>
            </div>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Use the slider on the interactive widget to see how much eco-impact and money you can unlock instantly by participating.
            </p>
          </motion.div>

          {/* Right Side: Compact Calculator Widget (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-5 rounded-[2rem] border border-border/80 bg-background/55 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Glowing background blob inside the card */}
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 rounded-full bg-emerald-500/10 blur-[50px] pointer-events-none" />
            
            <div className="border-b border-border/60 pb-3 mb-4 flex justify-between items-center relative z-10">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Recycle className="w-4 h-4 text-emerald-500 animate-spin-slow" /> Eco Impact Calculator
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">Real-time</span>
            </div>

            {/* Waste Selector Emojis */}
            <div className="space-y-3 relative z-10 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Waste Type</span>
                <span className="text-xs font-black text-emerald-500">{selectedWaste.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {WASTE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedWaste(type)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 ${
                      selectedWaste.id === type.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                        : 'border-border bg-background/30 hover:bg-muted/30 text-foreground'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{type.icon}</span>
                    <span className="text-[10px] font-bold">{type.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Slider */}
            <div className="space-y-3 pt-4 relative z-10 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weight</label>
                <span className="text-sm font-black text-foreground">{weight} kg</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500" 
              />
              <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase px-0.5">
                <span>1 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            {/* Compact Result Grid */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border/60 mt-5 relative z-10 text-left">
              <motion.div 
                key={`points-${points}`}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-muted/30 border border-border/40 rounded-2xl p-3 flex flex-col justify-between"
              >
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Green Points</span>
                <span className="text-lg font-black text-emerald-500 mt-1">+{points} pts</span>
              </motion.div>

              <motion.div 
                key={`co2-${co2}`}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-muted/30 border border-border/40 rounded-2xl p-3 flex flex-col justify-between"
              >
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ Saved</span>
                <span className="text-lg font-black text-blue-500 mt-1">{co2} kg</span>
              </motion.div>

              <motion.div 
                key={`landfill-${landfill}`}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-muted/30 border border-border/40 rounded-2xl p-3 flex flex-col justify-between"
              >
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Landfill Saved</span>
                <span className="text-lg font-black text-cyan-500 mt-1">{landfill} L</span>
              </motion.div>

              <motion.div 
                key={`trees-${treesEquivalent}`}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-muted/30 border border-border/40 rounded-2xl p-3 flex flex-col justify-between"
              >
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Trees Eq.</span>
                <span className="text-lg font-black text-green-500 mt-1">{treesEquivalent}/yr</span>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </section>


      {/* Point Redemption Showcase */}
      <section className="max-w-6xl mx-auto w-full px-6 py-12 z-10 relative">
        <div className="text-center mb-12">
          <span className="text-emerald-500 font-extrabold text-sm uppercase tracking-widest block mb-2">Instant Payouts & Bills</span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            How to Redeem Your Green Points
          </h2>
          <p className="text-muted-foreground mt-3 text-lg font-medium">
            Turn your eco-points into real savings. Convert points directly into monthly utility bill discounts or direct cash!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Direct Cash (UPI)", desc: "Transfer your earnings directly to your bank account via UPI instantly.", icon: "💵", color: "border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 text-emerald-500", delay: 0 },
            { title: "Electricity Bills", desc: "Redeem points to get instant discounts on your monthly electricity utility bill.", icon: "⚡", color: "border-amber-500/20 hover:border-amber-500 bg-amber-500/5 text-amber-500", delay: 0.4 },
            { title: "Water Bills", desc: "Pay your municipal water supply bills directly using your accrued Green Points.", icon: "💧", color: "border-blue-500/20 hover:border-blue-500 bg-blue-500/5 text-blue-500", delay: 0.8 },
            { title: "Groceries & Vouchers", desc: "Get discount vouchers for daily grocery items and local shopping outlets.", icon: "🛍️", color: "border-purple-500/20 hover:border-purple-500 bg-purple-500/5 text-purple-500", delay: 1.2 }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={floatVariants(item.delay)}
              animate="animate"
              whileHover={{ y: -12, scale: 1.05 }}
              className={`border rounded-3xl p-6 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all duration-300 ${item.color}`}
            >
              <div className="text-4xl mb-6">{item.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* USP Section: Turning Waste Into Wealth */}
      <section className="max-w-6xl mx-auto w-full px-6 py-16 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-emerald-500 font-extrabold text-sm uppercase tracking-widest block font-mono">The Project USP</span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              Waste Can Make Money. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                Fills Your Pockets, Saves the Nation!
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              SwachhTech is built on a simple yet revolutionary idea: **rewards for cleanliness**. By throwing your segregated dry/wet waste properly, you don't just clear trash—you collect value. 
            </p>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Our smart digital network connects local citizens with municipal workers. Once a worker scans your household's unique QR code and takes the segregated waste, you get points credited to your citizen app instantly. It's a win-win: making our country eco-friendly while making recycling financially rewarding for every family.
            </p>
            
            <div className="pt-4">
              <Link href="/auth/register" className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-105 transition-all">
                Join the Revolution
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 bg-gradient-to-b from-muted/50 to-background border border-border/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-16 -mt-16" />
            <h3 className="text-2xl font-black text-foreground mb-6">How It Works</h3>
            
            <div className="space-y-6">
              {[
                { step: "01", title: "Segregate Waste", desc: "Sort your dry (plastic, paper, metal) and wet waste at home." },
                { step: "02", title: "Scan household QR", desc: "Our field staff scans your QR code during collection to verify." },
                { step: "03", title: "Get Points Instantly", desc: "Points are immediately sent to your wallet based on waste weight." },
                { step: "04", title: "Redeem for Utility Bills & Cash", desc: "Pay bills or transfer cash back directly to your account!" }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <span className="text-2xl font-black text-emerald-500 font-mono">{step.step}</span>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer with Contact Info */}
      <footer className="w-full border-t border-border/60 bg-muted/20 backdrop-blur-md py-12 z-20 mt-20 relative">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span className="font-black text-xl text-foreground">SwachhTech</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              Making our cities cleaner, smarter, and greener through automated waste audits, optimized routes, and gamified community actions.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project Lead & Developer</span>
            <span className="text-lg font-black text-foreground font-sans">Krishna Gupta</span>
            <span className="text-sm text-emerald-500 font-bold font-mono">krishnagupta52784@gmail.com</span>
            <span className="text-xs text-muted-foreground font-medium mt-2">© 2026 SwachhTech. Built for Clean & Wealthy India.</span>
          </div>
        </div>
      </footer>
      
    </main>
  );
}
