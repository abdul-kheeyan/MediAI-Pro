import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, User, MessageSquare,
    FileText, Pill, ArrowRight, Activity,
    AlertCircle, ChevronRight, Plus, Sparkles, Brain, AlertTriangle, Zap, LogOut, Search, HeartPulse, Bell, BellDot, X, ShoppingCart, Video, Check
} from 'lucide-react';
import { io } from 'socket.io-client';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };

    const [healthTip, setHealthTip] = useState('Loading your daily insight...');
    const [notifications, setNotifications] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleProtectedAction = (path) => {
        if (!user) {
            setShowLoginModal(true);
        } else {
            navigate(path);
        }
    };

    const fetchHealthTip = async () => {
        try {
            const { data } = await api.get('/ai-features/health-tip');
            setHealthTip(data.healthTip);
        } catch {
            setHealthTip("Stay hydrated and maintain a balanced lifestyle.");
        }
    };

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    const fetchAppointments = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments');
        }
    };

    const markAsCompleted = async (id) => {
        try {
            await api.put(`/appointments/${id}`, { status: 'completed' });
            fetchAppointments();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    useEffect(() => {
        fetchHealthTip();
        fetchNotifications();
        fetchAppointments();

        // Socket.io Setup
        const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

        if (user) {
            socket.emit('join', user._id);
        }

        socket.on('notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
        });

        return () => socket.disconnect();
    }, [user]);

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    const stats = [
        { label: 'Upcoming', value: '2', icon: <Calendar size={24} className="text-white" />, dot: 'bg-blue-400', color: 'bg-blue-600', path: '/appointments' },
        { label: 'Health Vault', value: '14', icon: <FileText size={24} className="text-white" />, dot: 'bg-indigo-400', color: 'bg-indigo-600', path: '/records' },
        { label: 'Pharmacy', value: 'Shop', icon: <ShoppingCart size={24} className="text-white" />, dot: 'bg-emerald-400', color: 'bg-emerald-600', path: '/pharmacy' },
        { label: 'AI Insights', value: '5', icon: <MessageSquare size={24} className="text-white" />, dot: 'bg-indigo-400', color: 'bg-indigo-600', path: '/chat' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
            {/* Premium Navbar */}
            <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-8 py-5 flex items-center justify-between sticky top-0 z-[100] transition-all duration-300">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="bg-indigo-600 p-2.5 rounded-[1.25rem] shadow-premium group-hover:rotate-12 transition-transform duration-500">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-[900] text-slate-900 tracking-tighter leading-none">MediAI <span className="text-indigo-600">Pro</span></span>
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-0.5">Healthcare Intelligent</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-10">
                    <button
                        onClick={() => navigate('/emergency')}
                        className="bg-red-50 text-red-600 px-6 py-2.5 rounded-2xl text-[11px] font-[900] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-100 flex items-center gap-2 group shadow-sm"
                    >
                        <Zap size={14} className="group-hover:animate-pulse" fill="currentColor" /> SOS Emergency
                    </button>

                    <div className="flex items-center gap-4 pl-8 border-l border-slate-200">
                        {user ? (
                            <>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-[900] text-slate-900 leading-tight tracking-tight">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{user.role === 'doctor' ? `Verified ${user.role}` : user.role === 'pharmacy' ? 'Health Merchant' : 'Verified Patient'}</p>
                                </div>
                                <div className="group relative">
                                    <div
                                        onClick={() => handleProtectedAction('/profile')}
                                        className="w-11 h-11 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 overflow-hidden shadow-sm group-hover:border-indigo-600 transition-colors duration-300 cursor-pointer"
                                    >
                                        {user.profileImage ? (
                                            <img src={getImageUrl(user.profileImage)} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all duration-300 border border-slate-100 relative"
                                    >
                                        {notifications.some(n => !n.read) ? (
                                            <BellDot size={20} className="text-indigo-600 animate-pulse" />
                                        ) : (
                                            <Bell size={20} />
                                        )}
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                                {notifications.filter(n => !n.read).length}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[1000]"
                                            >
                                                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                    <h4 className="text-xs font-[1000] uppercase tracking-widest text-slate-900">Notifications</h4>
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800"
                                                    >
                                                        Mark all read
                                                    </button>
                                                </div>
                                                <div className="max-h-[400px] overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-10 text-center">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No new updates</p>
                                                        </div>
                                                    ) : (
                                                        notifications.map((notif, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors relative cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                                                            >
                                                                {!notif.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full"></div>}
                                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{notif.type}</p>
                                                                <h5 className="text-xs font-black text-slate-900 mb-1 leading-tight">{notif.title}</h5>
                                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                                                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={logout}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all duration-300 border border-slate-100"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                Login / Register
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-10">
                <header className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-3xl font-black text-slate-900 mb-2 tracking-tight"
                            >
                                Hello, {user ? user.name.split(' ')[0] : 'Guest'} 👋
                            </motion.h1>
                            <p className="text-slate-500 font-medium">Welcome to your health overview center.</p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-md bg-white/60 backdrop-blur-md border border-indigo-100 p-6 rounded-[2rem] shadow-premium group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                    <Sparkles size={16} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">MediAI Daily Insight</p>
                                    <p className="text-xs font-bold text-slate-700 italic leading-relaxed">
                                        "{healthTip}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                            onClick={() => stat.path && handleProtectedAction(stat.path)}
                            className="group bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100/60 relative overflow-hidden hover:border-indigo-100 transition-all duration-500 cursor-pointer"
                        >
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                                {stat.icon}
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        {stat.icon}
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${stat.dot} shadow-xl shadow-white ring-4 ring-slate-50`}></div>
                                </div>

                                <div>
                                    <p className="text-4xl font-[900] text-slate-900 tracking-tighter mb-1">
                                        {stat.label === 'Emergency' ? 'SOS' : stat.value}
                                    </p>
                                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden group">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <h2 className="text-xl font-[900] text-slate-900 tracking-tight">Upcoming Appointments</h2>
                                </div>
                                <button
                                    onClick={() => handleProtectedAction('/appointments')}
                                    className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 transition-all flex items-center gap-2 group/btn"
                                >
                                    Browse Schedule <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="p-8">
                                {appointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white shadow-premium rounded-full flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                            <Calendar className="text-slate-300" size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Clear Schedule Today</h3>
                                        <p className="text-slate-500 font-medium max-w-xs mb-8">You have no clinical appointments scheduled for the next 24 hours.</p>
                                        <button
                                            onClick={() => handleProtectedAction('/appointments')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} /> Book New Visit
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {appointments.slice(0, 3).map((apt, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-indigo-100 transition-all group/apt shadow-sm hover:shadow-md">
                                                <div className="flex items-center gap-5 mb-4 md:mb-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                                                        {(user?.role === 'patient' ? apt.doctor?.profileImage : apt.patient?.profileImage) ? (
                                                            <img src={getImageUrl(user?.role === 'patient' ? apt.doctor.profileImage : apt.patient.profileImage)} alt="User" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={`https://ui-avatars.com/api/?name=${user?.role === 'patient' ? apt.doctor?.name : apt.patient?.name}&background=eef2ff&color=4f46e5&bold=true`} alt="Fallback" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{user?.role === 'patient' ? `Dr. ${apt.doctor?.name}` : apt.patient?.name}</h4>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                                            {new Date(apt.date).toLocaleDateString()} • {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {apt.status === 'completed' ? (
                                                        <div className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200">
                                                            <Check size={14} /> Done
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => markAsCompleted(apt._id)}
                                                                className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                                            >
                                                                Done
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/video-call/${apt._id}`)}
                                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                                                            >
                                                                <Video size={14} /> Join Call
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="premium-gradient rounded-[2.5rem] shadow-premium p-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                                <HeartPulse size={240} className="text-white" />
                            </div>

                            <div className="relative z-10 bg-indigo-900/40 backdrop-blur-3xl rounded-[2.3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md mb-6 border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">AI Powered Assistant</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Feeling unwell?</h3>
                                    <p className="text-indigo-100/80 mb-0 max-w-sm text-lg font-medium leading-relaxed">
                                        Our AI platform analyzes your symptoms with clinical precision to guide you to the right care.
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleProtectedAction('/chat')}
                                    className="whitespace-nowrap bg-white text-indigo-900 px-8 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-3 shadow-xl active:scale-95 group/ai"
                                >
                                    <MessageSquare size={20} className="group-hover/ai:rotate-12 transition-transform" />
                                    Start Triage Chat
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        <section className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden group">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-xl font-[900] text-slate-900 tracking-tight">Health Vault</h2>
                                <button
                                    onClick={() => handleProtectedAction('/records')}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group/item">
                                        <div className="bg-white shadow-sm border border-slate-100 p-3.5 rounded-2xl group-hover/item:scale-110 transition-transform">
                                            <FileText size={22} className="text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 leading-none mb-1 text-sm">Clinical Report #{i * 3821}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Oct 12, 2023 • Cardiology</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleProtectedAction('/records')}
                                    className="w-full btn-primary py-3 rounded-2xl bg-slate-900 hover:bg-black text-[10px] uppercase tracking-[0.2em]"
                                >
                                    Access All Records
                                </button>
                            </div>
                        </section>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleProtectedAction('/ai-dashboard')}
                            className="bg-indigo-900 rounded-[2.5rem] p-10 cursor-pointer group shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles size={80} fill="currentColor" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/10 backdrop-blur-md">
                                        <Brain size={32} className="text-amber-300" />
                                    </div>
                                    <h3 className="text-3xl font-[1000] text-white mb-2 tracking-tight">Health Insights</h3>
                                    <p className="text-indigo-200 text-xs font-medium leading-relaxed max-w-[200px] opacity-80">
                                        Analyze medical reports & generate clinical diet plans.
                                    </p>
                                </div>
                                <div className="mt-10 flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                    Enter AI Hub <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>

                        <section className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 p-8 overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-100">
                                        <Clock className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-xl font-[900] text-slate-900 tracking-tight">Prescriptions</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    onClick={() => handleProtectedAction('/medications')}
                                    className="p-5 bg-orange-50/50 rounded-3xl border border-orange-100/50 cursor-pointer hover:bg-orange-50 transition-all group/med relative overflow-hidden"
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black tracking-widest text-orange-600 uppercase">Current Dosage</span>
                                        <div className="bg-orange-100 px-3 py-1 rounded-full">
                                            <span className="text-[9px] font-black text-orange-700">ACTIVE</span>
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-900 text-lg tracking-tight mb-1">Vitamin D3 <span className="text-slate-400 font-medium ml-1">1000 IU</span></p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                                            <Clock size={12} className="text-orange-500" /> Next dose at 08:30 AM
                                        </p>
                                        <div className="w-8 h-8 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Custom Login Required Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowLoginModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[2rem] shadow-premium p-8 max-w-md w-full border border-slate-100 text-center"
                        >
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Login Required</h3>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                To access premium health features, appointments, and AI triage, please log in or create an account.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-colors border border-slate-200"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    Login Now <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
