'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, Truck, AlertTriangle, BarChart3, Map as MapIcon, Settings, Trash2, CheckCircle2, MessageSquare, Megaphone, Edit, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MunicipalDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'fleet' | 'complaints' | 'feedback' | 'announcements'>('overview');

  const stats = [
    { label: "Total Waste Collected", value: "4,250 kg", icon: <Trash2 className="text-emerald-500" />, trend: "+12%" },
    { label: "Active Trucks", value: "45 / 50", icon: <Truck className="text-blue-500" />, trend: "90% active" },
    { label: "Pending Complaints", value: "12", icon: <AlertTriangle className="text-red-500" />, trend: "-3 since yesterday" },
    { label: "Green Citizens", value: "1,204", icon: <Users className="text-purple-500" />, trend: "+45 this week" },
  ];

  // Mocks
  const mockEmployees = [
    { id: 'EMP1001', name: 'Rajesh Kumar', role: 'Worker', ward: 'Ward 42', status: 'Active' },
    { id: 'EMP1002', name: 'Suresh Singh', role: 'Driver', ward: 'Ward 42', status: 'Active' },
    { id: 'EMP1003', name: 'Amit Patel', role: 'Worker', ward: 'Ward 45', status: 'On Leave' },
  ];

  const mockComplaints = [
    { id: 'CMP-1029', citizen: 'Neha S.', type: 'Illegal Dumping', status: 'Pending', date: '2 hrs ago' },
    { id: 'CMP-1030', citizen: 'Rahul M.', type: 'Missed Pickup', status: 'In Progress', date: '5 hrs ago' },
  ];

  const mockFeedback = [
    { id: 1, citizen: 'Priya D.', message: 'The new QR system is very fast!', rating: 5, date: 'Today' },
    { id: 2, citizen: 'Vikram B.', message: 'Truck was late by 1 hour today.', rating: 3, date: 'Yesterday' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <span className="font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-500">MUNICIPAL</span> HQ
          </span>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <div className="hidden md:block text-xs font-bold text-slate-500 mb-2 px-2 uppercase tracking-wider">Control Panel</div>
          
          {[
            { id: 'overview', icon: <BarChart3 className="w-5 h-5 mr-3" />, label: 'Overview' },
            { id: 'employees', icon: <Users className="w-5 h-5 mr-3" />, label: 'Staff Management' },
            { id: 'fleet', icon: <MapIcon className="w-5 h-5 mr-3" />, label: 'Fleet Tracking' },
            { id: 'complaints', icon: <AlertTriangle className="w-5 h-5 mr-3" />, label: 'Complaints' },
            { id: 'feedback', icon: <MessageSquare className="w-5 h-5 mr-3" />, label: 'Citizen Feedback' },
            { id: 'announcements', icon: <Megaphone className="w-5 h-5 mr-3" />, label: 'Broadcasts' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 md:w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              {tab.icon} <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:block p-4 border-t border-slate-800 bg-slate-950">
          <button onClick={logout} className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-slate-400 font-bold hover:bg-red-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
              <p className="text-slate-500 font-medium">Real-time oversight of city waste operations.</p>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">{stat.icon}</div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Live Operations Map</h3>
                  <div className="w-full h-80 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <MapIcon className="w-12 h-12 mb-2 text-slate-300" />
                    <p className="font-medium">Map View Integration Placeholder</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Priority Issues</h3>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl border border-red-100 bg-red-50 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Bin Overflow - Sector 4</p>
                        <p className="text-xs text-slate-500 mt-1">Worker MH-04 assigned.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input type="text" placeholder="Search employees..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-600">
                  + Add Employee
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                      <th className="p-4 font-bold">ID</th>
                      <th className="p-4 font-bold">Name</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold">Assigned Ward</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{emp.id}</td>
                        <td className="p-4 text-slate-600">{emp.name}</td>
                        <td className="p-4 text-slate-600">{emp.role}</td>
                        <td className="p-4 text-slate-600">{emp.ward}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-blue-500 hover:text-blue-700 mr-3"><Edit className="w-4 h-4" /></button>
                          <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="w-full h-[600px] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <MapIcon className="w-16 h-16 mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-600">Advanced Fleet Tracking Enabled</h3>
                <p className="mt-2 text-center max-w-md">The system is now capable of pulling live latitude/longitude points from the Truck DB table and mapping them here.</p>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {mockComplaints.map(cmp => (
                  <div key={cmp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-slate-900">{cmp.type}</span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{cmp.id}</span>
                      </div>
                      <p className="text-sm text-slate-600">Reported by {cmp.citizen} • {cmp.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>
                      <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">Update</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
                <h3 className="font-bold text-lg mb-4 border-b border-slate-100 pb-2">Filter</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked /> Pending</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked /> In Progress</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" /> Resolved</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFeedback.map(fb => (
                <div key={fb.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-slate-900">{fb.citizen}</p>
                      <p className="text-xs text-slate-500">{fb.date}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <span key={i}>{i < fb.rating ? '★' : '☆'}</span>)}
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{fb.message}"</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center"><Megaphone className="mr-2 text-emerald-500" /> New Broadcast</h3>
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
                  <select className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>All Users (Citizens & Workers)</option>
                    <option>Citizens Only</option>
                    <option>Workers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Title</label>
                  <input type="text" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Schedule Change for Diwali" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea className="w-full border border-slate-300 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter full details here..."></textarea>
                </div>
                <button type="button" className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-md">
                  Send Broadcast
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
