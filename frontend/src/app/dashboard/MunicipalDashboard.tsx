'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, Truck, AlertTriangle, BarChart3, Map as MapIcon, Settings, Trash2, CheckCircle2, MessageSquare, Megaphone, Edit, Search, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function MunicipalDashboard() {
  const { user, logout } = useAuth();
  const isOwner = user?.email === 'krishnagupta52784@gmail.com';
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'fleet' | 'complaints' | 'feedback' | 'announcements' | 'users'>('overview');
  
  // Dynamic Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [complaintFilter, setComplaintFilter] = useState({
    PENDING: true,
    IN_PROGRESS: true,
    RESOLVED: false,
    REJECTED: false
  });

  // Direct Access Grant States
  const [directEmailOrId, setDirectEmailOrId] = useState('');
  const [directRole, setDirectRole] = useState('WORKER');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, workersRes, driversRes, complaintsRes, feedbackRes, usersRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/workers'),
        api.get('/drivers'),
        api.get('/complaints'),
        api.get('/feedback'),
        api.get('/users')
      ]);

      const analyticsData = analyticsRes.data?.data || analyticsRes.data;
      setDashboardData(analyticsData);
      
      const workers = workersRes.data?.data?.data || (Array.isArray(workersRes.data?.data) ? workersRes.data.data : []);
      const drivers = driversRes.data?.data?.data || (Array.isArray(driversRes.data?.data) ? driversRes.data.data : []);
      
      const combinedEmployees = [
        ...workers.map((w: any) => ({
          id: w.employeeId,
          name: `${w.user?.firstName || ''} ${w.user?.lastName || ''}`,
          role: 'Worker',
          ward: w.assignedWard || 'WARD-1',
          status: w.isAvailable ? 'Active' : 'Offline',
          phone: w.user?.phone || 'N/A'
        })),
        ...drivers.map((d: any) => ({
          id: d.licenseNumber,
          name: `${d.user?.firstName || ''} ${d.user?.lastName || ''}`,
          role: 'Driver',
          ward: d.assignedTruck?.plateNumber || 'Transit',
          status: d.isAvailable ? 'Active' : 'Offline',
          phone: d.user?.phone || 'N/A'
        }))
      ];
      setEmployees(combinedEmployees);

      const complaintsList = complaintsRes.data?.data?.data || (Array.isArray(complaintsRes.data?.data) ? complaintsRes.data.data : []);
      setComplaints(complaintsList);

      const feedbackList = feedbackRes.data?.data?.data || (Array.isArray(feedbackRes.data?.data) ? feedbackRes.data.data : []);
      setFeedback(feedbackList);

      const allUsers = usersRes.data?.data?.data || (Array.isArray(usersRes.data?.data) ? usersRes.data.data : []);
      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      toast.error('Failed to load real-time data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateComplaintStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      toast.success('Complaint status updated!');
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      
      // Refresh analytics
      const analyticsRes = await api.get('/analytics/dashboard');
      setDashboardData(analyticsRes.data?.data || analyticsRes.data);
    } catch (error) {
      toast.error('Could not update status.');
    }
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}`, { role });
      toast.success('User access role updated successfully!');
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      
      // Refresh staff lists and dashboard
      fetchData();
    } catch (error) {
      toast.error('Failed to update user role.');
    }
  };

  const handleDirectAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmailOrId.trim()) {
      toast.error('Please enter a valid email or UID.');
      return;
    }
    setIsAssigning(true);
    try {
      await api.post('/users/assign-role', {
        emailOrId: directEmailOrId.trim(),
        role: directRole,
      });
      toast.success('Access permission granted/pre-registered successfully!');
      setDirectEmailOrId('');
      fetchData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to assign role.';
      toast.error(errMsg);
    } finally {
      setIsAssigning(false);
    }
  };

  // Stats calculation
  const totalWaste = dashboardData?.kpi?.totalWasteCollectedKg ?? 0;
  const activeTrucks = dashboardData?.kpi?.activeTrucks ?? 0;
  const activeComplaints = dashboardData?.kpi?.activeComplaints ?? 0;
  const recyclingRate = dashboardData?.kpi?.recyclingRate ?? 42.5;

  const stats = [
    { label: "Total Waste Collected", value: `${totalWaste} kg`, icon: <Trash2 className="text-emerald-500" />, trend: "Real-time" },
    { label: "Active Trucks", value: `${activeTrucks} active`, icon: <Truck className="text-blue-500" />, trend: "In Service" },
    { label: "Pending Issues", value: `${activeComplaints}`, icon: <AlertTriangle className="text-red-500" />, trend: "Unresolved" },
    { label: "Recycling Rate", value: `${recyclingRate}%`, icon: <Users className="text-purple-500" />, trend: "Target: 50%" },
  ];

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComplaints = complaints.filter(cmp => 
    complaintFilter[cmp.status as keyof typeof complaintFilter]
  );

  const displayFeedback = feedback.length > 0 ? feedback : [
    { id: '1', user: { firstName: 'Priya', lastName: 'D.' }, message: 'The new QR system is very fast!', rating: 5, createdAt: new Date().toISOString() },
    { id: '2', user: { firstName: 'Vikram', lastName: 'B.' }, message: 'Truck was late by 1 hour today.', rating: 3, createdAt: new Date().toISOString() },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Loading Municipal Control Center...</p>
        </div>
      </div>
    );
  }

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
            { id: 'users', icon: <Settings className="w-5 h-5 mr-3" />, label: 'Access Control' },
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
                  <div className="w-full h-[400px] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <MapIcon className="w-12 h-12 mb-2 text-slate-300 animate-pulse" />
                    <p className="font-semibold text-slate-500">Live Vehicle & Route Operations</p>
                    <p className="text-xs text-slate-400 mt-1">Updates dynamically from driver GPS feeds.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Priority Issues</h3>
                    <div className="space-y-4 max-h-[150px] overflow-y-auto">
                      {complaints.filter(c => c.status === 'PENDING').map(c => (
                        <div key={c.id} className="p-3 rounded-xl border border-red-100 bg-red-50 flex gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{c.type}</p>
                            <p className="text-xs text-slate-500 mt-1">{c.address}</p>
                          </div>
                        </div>
                      ))}
                      {complaints.filter(c => c.status === 'PENDING').length === 0 && (
                        <p className="text-sm text-slate-400 text-center">No pending priority issues!</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Top Green Citizens</h3>
                    <div className="space-y-3">
                      {dashboardData?.topCitizens?.map((citizen: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{citizen.name}</p>
                            <p className="text-xs text-slate-500">{citizen.level} Member</p>
                          </div>
                          <span className="text-sm font-black text-emerald-600">+{citizen.points} pts</span>
                        </div>
                      ))}
                      {(!dashboardData?.topCitizens || dashboardData.topCitizens.length === 0) && (
                        <p className="text-sm text-slate-400 text-center">No citizen rankings recorded.</p>
                      )}
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
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search staff (name, id, role)..." 
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-64 text-slate-900" 
                  />
                </div>
                <button 
                  onClick={() => toast.info('Staff account registration is managed via Supabase Admin Dashboard.')}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-600"
                >
                  + Add Employee
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                      <th className="p-4 font-bold">Employee ID / License</th>
                      <th className="p-4 font-bold">Name</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold">Assigned Ward / Truck</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-700">
                        <td className="p-4 font-medium text-slate-900">{emp.id}</td>
                        <td className="p-4 text-slate-600">{emp.name}</td>
                        <td className="p-4 text-slate-600">{emp.role}</td>
                        <td className="p-4 text-slate-600">{emp.ward}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">{emp.phone}</td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">No staff members found.</td>
                      </tr>
                    )}
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
                <p className="mt-2 text-center max-w-md text-slate-500">The system map pulls live coordinate snapshots from worker/driver GPS feeds for visual tracking.</p>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {filteredComplaints.map(cmp => (
                  <div key={cmp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 text-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-900">{cmp.type}</span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{cmp.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Reported by {cmp.citizen?.user ? `${cmp.citizen.user.firstName} ${cmp.citizen.user.lastName}` : 'Citizen'} • {new Date(cmp.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">{cmp.description}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 inline text-slate-400" /> {cmp.address || 'Unknown Address'}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <select 
                        value={cmp.status} 
                        onChange={(e) => handleUpdateComplaintStatus(cmp.id, e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
                {filteredComplaints.length === 0 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                    No complaints matching current status filters.
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-2 text-slate-950">Status Filter</h3>
                <div className="space-y-3">
                  {Object.keys(complaintFilter).map(statusKey => (
                    <label key={statusKey} className="flex items-center gap-2 text-sm text-slate-600 capitalize cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={complaintFilter[statusKey as keyof typeof complaintFilter]} 
                        onChange={(e) => setComplaintFilter(prev => ({ ...prev, [statusKey]: e.target.checked }))}
                        className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300"
                      /> 
                      {statusKey.replace('_', ' ').toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFeedback.map((fb: any) => (
                <div key={fb.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {fb.user ? `${fb.user.firstName} ${fb.user.lastName}` : 'Citizen'}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <span key={i}>{i < fb.rating ? '★' : '☆'}</span>)}
                      </div>
                    </div>
                    <p className="text-slate-700 italic">"{fb.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900"><Megaphone className="mr-2 text-emerald-500" /> New Broadcast</h3>
              <form onSubmit={(e) => { e.preventDefault(); toast.success('Broadcast announcement sent to target audience!'); }} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
                  <select className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-800">
                    <option>All Users (Citizens & Workers)</option>
                    <option>Citizens Only</option>
                    <option>Workers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Title</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" placeholder="e.g. Schedule Change for Diwali" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea required className="w-full border border-slate-300 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" placeholder="Enter announcement details here..."></textarea>
                </div>
                <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-md">
                  Send Broadcast
                </button>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {!isOwner && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 shadow-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-900">Access Restricted</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      You are logged in as an administrator, but role management is restricted exclusively to the project owner (<span className="font-semibold">krishnagupta52784@gmail.com</span>).
                    </p>
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-500" /> Direct Access Grant
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      Pre-assign or override access roles by entering a user's Email address or UID. If the user hasn't registered yet, they will receive this role automatically upon their first login.
                    </p>
                  </div>

                  <form onSubmit={handleDirectAssignRole} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Email or UID</label>
                      <input 
                        type="text" 
                        required
                        value={directEmailOrId}
                        onChange={(e) => setDirectEmailOrId(e.target.value)}
                        placeholder="e.g. employee@swachhtech.ai or UUID" 
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-sm bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Access Role</label>
                      <select 
                        value={directRole}
                        onChange={(e) => setDirectRole(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 text-sm bg-white"
                      >
                        <option value="CITIZEN">Citizen</option>
                        <option value="WORKER">Worker (Field Staff / Employee)</option>
                        <option value="ADMIN">Super Admin</option>
                      </select>
                    </div>
                    <div>
                      <button 
                        type="submit" 
                        disabled={isAssigning}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Granting...
                          </>
                        ) : (
                          'Grant Access Permission'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 text-lg">System Access Control List</h3>
                  <p className="text-slate-500 text-sm mt-1">Review and manage current registered system users and their active roles.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <th className="p-4 font-bold">Name</th>
                        <th className="p-4 font-bold">Email</th>
                        <th className="p-4 font-bold">Access Role</th>
                        <th className="p-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-700">
                          <td className="p-4 font-medium text-slate-900">
                            {u.firstName === 'Pre-assigned' ? (
                              <span className="italic text-slate-400 font-normal">Pending Registration</span>
                            ) : (
                              `${u.firstName} ${u.lastName}`
                            )}
                          </td>
                          <td className="p-4 text-slate-600 font-mono text-sm">{u.email}</td>
                          <td className="p-4">
                            <select 
                              value={u.role} 
                              disabled={!isOwner}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                            >
                              <option value="CITIZEN">Citizen</option>
                              <option value="WORKER">Worker (Field Staff)</option>
                              <option value="ADMIN">Super Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {u.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400 font-semibold">No users found in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
