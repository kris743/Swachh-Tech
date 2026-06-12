'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, LogOut, Loader2, CheckCircle2, MapPin, Clock, Bell, AlertTriangle, Truck, Navigation, Activity, BookOpen, HeartPulse, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'route' | 'scan' | 'alerts' | 'performance' | 'training' | 'health'>('route');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode) return;
    setIsScanning(true);
    try {
      await api.post('/qr-codes/scan', { code: scannedCode, gpsLatitude: 28.6139, gpsLongitude: 77.2090, wasteType: 'WET' });
      toast.success('Successfully scanned and recorded!');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setScannedCode('');
    } catch (error: any) {
      toast.error('Error processing scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAttendance = () => {
    setIsCheckedIn(!isCheckedIn);
    toast.success(isCheckedIn ? 'Successfully Checked Out for the day.' : 'Successfully Checked In. Have a safe shift!');
  };

  // Mock data
  const routeAssignments = [
    { id: 1, area: "Connaught Place, Block A", time: "08:00 AM", status: "completed" },
    { id: 2, area: "Connaught Place, Block B", time: "09:30 AM", status: "in-progress" },
  ];
  const liveAlerts = [
    { id: 101, type: "OVERFLOW", location: "Bin #402, CP Block B", time: "10 mins ago", urgent: true },
    { id: 102, type: "ANNOUNCEMENT", location: "Safety Guidelines Updated", time: "1 hr ago", urgent: false },
  ];
  const mockTraining = [
    { id: 1, title: "Hazardous Waste Handling", duration: "15 mins", completed: true },
    { id: 2, title: "Heatwave Safety Protocol", duration: "10 mins", completed: false },
  ];
  const healthRecords = [
    { id: 1, date: "2023-08-15", doctor: "Dr. Sharma", status: "FIT", notes: "Routine 6-month checkup. BP normal." },
    { id: 2, date: "2023-02-10", doctor: "Dr. Verma", status: "FIT", notes: "Vaccination updated (Tetanus)." },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex flex-col md:flex-row">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-row md:flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 w-full md:w-auto justify-between md:justify-start">
          <span className="font-black tracking-tight text-orange-500 flex items-center gap-2"><Truck className="w-5 h-5" /> OPERATIONS</span>
        </div>
        
        <div className="p-4 border-b border-slate-800 hidden md:block">
          <button 
            onClick={handleAttendance}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCheckedIn ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'}`}
          >
            <Clock className="w-5 h-5" /> {isCheckedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
        
        <div className="flex-1 py-4 px-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <div className="hidden md:block text-xs font-bold text-slate-500 mb-2 px-2 uppercase">Menu</div>
          
          {[
            { id: 'route', icon: <Navigation className="w-5 h-5 mr-3" />, label: 'My Route' },
            { id: 'scan', icon: <ScanLine className="w-5 h-5 mr-3" />, label: 'QR Scanner' },
            { id: 'alerts', icon: <Bell className="w-5 h-5 mr-3" />, label: 'Alerts & Updates' },
            { id: 'performance', icon: <Activity className="w-5 h-5 mr-3" />, label: 'Performance' },
            { id: 'training', icon: <BookOpen className="w-5 h-5 mr-3" />, label: 'Training' },
            { id: 'health', icon: <HeartPulse className="w-5 h-5 mr-3" />, label: 'Health Records' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 md:w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {tab.icon} <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:block p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-start overflow-y-auto z-10">
        <div className="w-full max-w-2xl">
          
          <header className="mb-8 mt-4 md:mt-0 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black mb-2 text-white capitalize">{activeTab.replace('-', ' ')}</h1>
              <p className="text-slate-400 font-medium">Truck: MH-04-1234 • Status: {isCheckedIn ? <span className="text-emerald-500">On Duty</span> : <span className="text-slate-500">Off Duty</span>}</p>
            </div>
          </header>

          {activeTab === 'route' && (
            <div className="space-y-4">
              {routeAssignments.map((stop, i) => (
                <div key={stop.id} className={`p-4 rounded-xl border ${stop.status === 'in-progress' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800 border-slate-700'} flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">{i + 1}</div>
                    <div>
                      <p className="font-bold">{stop.area}</p>
                      <p className="text-sm text-slate-400"><Clock className="w-3 h-3 inline mr-1" /> {stop.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700">
              <ScanLine className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <form onSubmit={handleScan} className="max-w-xs mx-auto space-y-4">
                <input value={scannedCode} onChange={(e) => setScannedCode(e.target.value)} placeholder="QR Code..." className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-orange-500 outline-none uppercase" />
                <button type="submit" disabled={isScanning || !isCheckedIn} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl disabled:opacity-50">
                  {isScanning ? 'Processing...' : 'Record'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {liveAlerts.map(alert => (
                <div key={alert.id} className={`p-5 rounded-xl border ${alert.urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                  <p className={`text-xs font-bold mb-1 ${alert.urgent ? 'text-red-500' : 'text-blue-500'}`}>{alert.type}</p>
                  <h3 className="font-bold text-lg">{alert.location}</h3>
                  <p className="text-sm text-slate-400 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-slate-400 font-bold mb-2">Total Collections</p>
                <p className="text-4xl font-black text-orange-500">1,204</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-slate-400 font-bold mb-2">Average Rating</p>
                <p className="text-4xl font-black text-yellow-500">4.8 <span className="text-lg">★</span></p>
              </div>
              <div className="col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-slate-400 font-bold mb-2">Reward Points</p>
                <p className="text-5xl font-black text-emerald-500">450</p>
                <p className="text-sm text-slate-500 mt-2">Earned through zero-complaint weeks and high ratings.</p>
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-4">
              {mockTraining.map(mod => (
                <div key={mod.id} className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{mod.title}</h3>
                    <p className="text-sm text-slate-400">{mod.duration}</p>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-bold text-sm ${mod.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500 text-white'}`}>
                    {mod.completed ? 'Completed' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center mb-6">
                <UserCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-emerald-500 text-lg">Current Status: FIT FOR DUTY</h3>
                <p className="text-sm text-emerald-500/80 mt-1">Last checkup was 4 months ago. Next checkup due in 2 months.</p>
              </div>
              {healthRecords.map(record => (
                <div key={record.id} className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                  <div className="flex justify-between mb-2">
                    <p className="font-bold">{record.date}</p>
                    <span className="text-emerald-500 text-sm font-bold">{record.status}</span>
                  </div>
                  <p className="text-sm text-slate-400">Attended by {record.doctor}</p>
                  <p className="text-sm mt-2">{record.notes}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
