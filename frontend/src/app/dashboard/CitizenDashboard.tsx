'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Camera, MapPin, Trophy, Leaf, Trash2, Bell, LogOut, ChevronRight, QrCode, Truck, BookOpen, MessageSquare, AlertCircle, Award, History, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import ReportComplaintModal from '@/components/ReportComplaintModal';
import QRCodeModal from '@/components/QRCodeModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function CitizenDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'training' | 'complaints' | 'feedback' | 'incentives'>('overview');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  
  const points = user?.citizenProfile?.rewardPoints || 0;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleReportSuccess = () => refreshUser();

  const containerVars: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  // Translations object
  const t = {
    EN: {
      overview: 'Overview', tracking: 'Truck Tracking', training: 'Training & Awareness', 
      complaints: 'My Complaints', feedback: 'Feedback', incentives: 'Incentives & Fines',
      welcome: `Welcome back, ${user?.firstName || 'Citizen'}! 👋`,
      subtitle: "You're doing great! You are currently in the top 5% of citizens in Ward 42 for waste segregation.",
      quickActions: "Quick Actions", reportIssue: "Report Issue", myQR: "My QR Code", leaderboard: "Leaderboard"
    },
    HI: {
      overview: 'अवलोकन', tracking: 'ट्रक ट्रैकिंग', training: 'प्रशिक्षण और जागरूकता', 
      complaints: 'मेरी शिकायतें', feedback: 'प्रतिक्रिया', incentives: 'प्रोत्साहन और जुर्माना',
      welcome: `वापसी पर स्वागत है, ${user?.firstName || 'नागरिक'}! 👋`,
      subtitle: "आप बहुत अच्छा कर रहे हैं! कचरा पृथक्करण के लिए आप वार्ड 42 में शीर्ष 5% नागरिकों में हैं।",
      quickActions: "त्वरित कार्रवाई", reportIssue: "समस्या दर्ज करें", myQR: "मेरा क्यूआर कोड", leaderboard: "लीडरबोर्ड"
    }
  }[language];

  // Mock data for new tabs
  const mockComplaints = [
    { id: 'CMP-1029', type: 'Illegal Dumping', status: 'Resolved', date: '2023-10-12', resolvedAt: '2023-10-14' },
    { id: 'CMP-1045', type: 'Missed Pickup', status: 'In Progress', date: '2023-10-15', resolvedAt: null },
  ];

  const mockLedger = [
    { id: 1, action: 'Daily Waste Collection', points: '+10', date: 'Today, 8:30 AM', type: 'reward' },
    { id: 2, action: 'Overflowing Bin Reported', points: '+25', date: 'Yesterday', type: 'reward' },
    { id: 3, action: 'Mixed Waste Penalty', points: '-5', date: 'Oct 10, 2023', type: 'fine' },
  ];

  const mockTraining = [
    { id: 1, title: 'How to Segregate Dry and Wet Waste', duration: '5 mins', completed: true },
    { id: 2, title: 'Composting at Home', duration: '12 mins', completed: false },
    { id: 3, title: 'Understanding E-Waste', duration: '8 mins', completed: false },
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(language === 'EN' ? 'Feedback submitted successfully!' : 'प्रतिक्रिया सफलतापूर्वक जमा की गई!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <ReportComplaintModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onReportSuccess={handleReportSuccess} />
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border glass hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Leaf className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold tracking-tight text-primary">SWACHH TECH</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">Main Menu</div>
          
          {[
            { id: 'overview', icon: <MapPin className="w-4 h-4 mr-3" />, label: t.overview },
            { id: 'tracking', icon: <Truck className="w-4 h-4 mr-3" />, label: t.tracking },
            { id: 'training', icon: <BookOpen className="w-4 h-4 mr-3" />, label: t.training },
            { id: 'complaints', icon: <History className="w-4 h-4 mr-3" />, label: t.complaints },
            { id: 'feedback', icon: <MessageSquare className="w-4 h-4 mr-3" />, label: t.feedback },
            { id: 'incentives', icon: <Award className="w-4 h-4 mr-3" />, label: t.incentives },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-2">
          {/* Language Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-xs font-bold text-muted-foreground">Language</span>
            <div className="flex bg-background rounded-md p-1 border border-border">
              <button onClick={() => setLanguage('EN')} className={`text-xs px-2 py-1 rounded ${language === 'EN' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}>EN</button>
              <button onClick={() => setLanguage('HI')} className={`text-xs px-2 py-1 rounded ${language === 'HI' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}>HI</button>
            </div>
          </div>

          <button onClick={logout} className="w-full flex items-center px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-4 h-4 mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border glass flex items-center justify-between px-6 lg:px-10 shrink-0">
          <h1 className="text-xl font-bold">{t[activeTab]}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-black font-bold shadow-lg shadow-primary/20">
              {user?.firstName?.charAt(0) || 'C'}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8">
                <motion.div variants={itemVars} className="glass rounded-2xl p-8 relative overflow-hidden border border-border shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[64px]" />
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{t.welcome}</h2>
                      <p className="text-muted-foreground max-w-lg">{t.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-6 glass-panel px-6 py-4 rounded-xl border border-border">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                          <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="226" strokeDashoffset={226 - (points / 5000) * 226} className="text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute text-xl font-bold">Lv.4</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-1">Platinum Tier</div>
                        <div className="text-3xl font-extrabold">{points} <span className="text-sm font-normal text-muted-foreground">pts</span></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div onClick={() => setIsReportModalOpen(true)} className="glass-card rounded-2xl p-6 group cursor-pointer hover:bg-muted/50 transition-colors border border-border shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{t.reportIssue}</h3>
                    <p className="text-sm text-muted-foreground">Spotted illegal dumping? Snap a photo.</p>
                  </div>
                  <div onClick={() => setIsQRModalOpen(true)} className="glass-card rounded-2xl p-6 group cursor-pointer hover:bg-muted/50 transition-colors border border-border shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <QrCode className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{t.myQR}</h3>
                    <p className="text-sm text-muted-foreground">Show QR for daily waste collection.</p>
                  </div>
                  <div className="glass-card rounded-2xl p-6 group cursor-pointer hover:bg-muted/50 transition-colors border border-border shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{t.leaderboard}</h3>
                    <p className="text-sm text-muted-foreground">Check your rank in the city.</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* TRUCK TRACKING TAB */}
            {activeTab === 'tracking' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="glass rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="text-xl font-bold flex items-center mb-4"><MapIcon className="w-6 h-6 text-primary mr-2" /> Live Collection Truck</h3>
                  <p className="text-muted-foreground mb-6">Track the garbage collection truck assigned to your ward in real-time.</p>
                  <div className="w-full h-96 bg-muted/50 rounded-xl border border-border flex items-center justify-center flex-col">
                    <MapIcon className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="font-bold text-muted-foreground">Interactive Map Integration</p>
                    <p className="text-sm text-muted-foreground/70">Connecting to existing Leaflet/Google Maps instance...</p>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center">
                    <Truck className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <p className="font-bold text-primary">Truck MH-04-1234 is 2.5 km away.</p>
                      <p className="text-sm text-primary/80">Estimated arrival time: 15 minutes.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TRAINING & AWARENESS TAB */}
            {activeTab === 'training' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockTraining.map(mod => (
                    <div key={mod.id} className="glass rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><BookOpen className="w-5 h-5" /></div>
                          {mod.completed && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{mod.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Learn the best practices to earn more Green Points. Duration: {mod.duration}</p>
                      </div>
                      <button className={`w-full py-2.5 rounded-lg font-bold text-sm ${mod.completed ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                        {mod.completed ? 'Review Material' : 'Start Lesson'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-end mb-4">
                  <button onClick={() => setIsReportModalOpen(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center shadow-sm">
                    <Camera className="w-4 h-4 mr-2" /> New Complaint
                  </button>
                </div>
                <div className="glass rounded-2xl border border-border overflow-hidden shadow-sm">
                  {mockComplaints.map(cmp => (
                    <div key={cmp.id} className="p-5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{cmp.type}</span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted border border-border">{cmp.id}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Reported on: {cmp.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${cmp.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
                          {cmp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                <form onSubmit={handleFeedbackSubmit} className="glass rounded-2xl border border-border p-8 shadow-sm">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Help Us Improve</h3>
                  <p className="text-muted-foreground mb-6">Submit your feedback directly to the Municipal Authority.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" className="p-2 rounded-lg bg-muted border border-border hover:border-primary text-muted-foreground hover:text-yellow-500 transition-colors">
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Message</label>
                      <textarea required className="w-full bg-background border border-border rounded-xl p-4 focus:ring-2 focus:ring-primary focus:outline-none min-h-[120px]" placeholder="Tell us about your experience..." />
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-md hover:bg-primary/90 transition-colors">
                      Submit Feedback
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* INCENTIVES TAB */}
            {activeTab === 'incentives' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="glass rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center">
                    <Award className="w-8 h-8 text-yellow-500 mb-2" />
                    <p className="text-sm text-muted-foreground font-bold uppercase">Current Balance</p>
                    <p className="text-3xl font-black text-foreground">{points} pts</p>
                  </div>
                  <div className="glass rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center md:col-span-2 bg-gradient-to-br from-primary/10 to-transparent">
                    <h3 className="text-lg font-bold mb-2">Redeem Points</h3>
                    <p className="text-sm text-muted-foreground mb-4">Use your Green Points for discounts on property tax, water bills, or local eco-friendly stores.</p>
                    <button className="bg-background border border-border px-6 py-2 rounded-lg font-bold shadow-sm hover:border-primary transition-colors">View Store</button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Points Ledger</h3>
                <div className="glass rounded-2xl border border-border overflow-hidden shadow-sm">
                  {mockLedger.map(tx => (
                    <div key={tx.id} className="p-5 border-b border-border last:border-0 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.type === 'reward' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type === 'reward' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold">{tx.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
                        </div>
                      </div>
                      <div className={`font-black text-lg ${tx.type === 'reward' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.points}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
