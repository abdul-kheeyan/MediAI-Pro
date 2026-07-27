import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Check, X, Search,
    Activity, LogOut, User as UserIcon,
    Loader2, Filter, MoreVertical,
    Clock, ArrowRight, Video, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [submittingReport, setSubmittingReport] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);
    const [reportData, setReportData] = useState({
        diagnosis: '',
        notes: ''
    });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            fetchAppointments();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const generateReport = () => {
        if (appointments.length === 0) {
            toast.error('No appointments to generate report from');
            return;
        }

        const headers = ['Patient Name', 'Date', 'Time', 'Reason', 'Status'];
        const rows = appointments.map(appt => [
            appt.patient?.name || 'Unknown',
            new Date(appt.date).toLocaleDateString(),
            new Date(appt.date).toLocaleTimeString(),
            appt.reason || 'N/A',
            appt.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Clinical_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReport(true);
        try {
            await api.post('/records', {
                patientId: selectedApt.patient._id,
                diagnosis: reportData.diagnosis,
                notes: reportData.notes
            });
            setShowReportModal(false);
            setReportData({ diagnosis: '', notes: '' });
            toast.success('Medical report submitted to patient vault!');
        } catch (error) {
            toast.error('Failed to submit report');
        } finally {
            setSubmittingReport(false);
        }
    };


    const filteredAppointments = appointments.filter(appt =>
        appt.patient?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Registered Patients', value: '1,284', icon: <Users size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Pending Requests', value: appointments.filter(a => a.status === 'pending').length.toString(), icon: <Calendar size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Completed Today', value: '12', icon: <Check size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Patient Satisfaction', value: '98%', icon: <Activity size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
            {/* Premium Header/Nav */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-[900] text-slate-900 tracking-tight leading-none block">MediAI <span className="text-indigo-600">Pro</span></span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Clinical Workspace</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-4 px-6 border-r border-slate-100">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 leading-tight">Dr. {user?.name}</p>
                            <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest">{user?.specialization || 'Chief Medical Officer'}</p>
                        </div>
                        <div
                            onClick={() => navigate('/profile')}
                            className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group cursor-pointer hover:border-indigo-200 transition-all overflow-hidden"
                        >
                            {user?.profileImage ? (
                                <img src={getImageUrl(user.profileImage)} alt="Dr Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={20} className="group-hover:text-indigo-500 transition-colors" />
                            )}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100/50"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8 lg:p-12">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Systems Operational</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <h1 className="text-4xl font-[900] text-slate-900 tracking-tight">Physician Dashboard</h1>
                        <p className="text-slate-500 mt-2 font-medium">Welcome back, Dr. {user?.name.split(' ')[0]}. Here is your clinical overview for today.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white border border-slate-200 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                            <Filter size={16} /> Filter View
                        </button>
                        <button
                            onClick={generateReport}
                            className="btn-primary py-4 px-8 rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2"
                        >
                            Generate Report <ArrowRight size={16} />
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100/50 group hover:border-indigo-200 transition-all duration-500"
                        >
                            <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                {stat.icon}
                            </div>
                            <p className="text-3xl font-[900] text-slate-900 leading-tight mb-1">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Appointments Section */}
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100/50 overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                        <div>
                            <h2 className="text-2xl font-[900] text-slate-900 tracking-tight mb-1">Clinical Consultations</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incoming triage and scheduled requests</p>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search medical files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 w-full md:w-80 transition-all shadow-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                    <th className="px-10 py-6">Patient Profile</th>
                                    <th className="px-10 py-6">Schedule</th>
                                    <th className="px-10 py-6">Medical Concern</th>
                                    <th className="px-10 py-6">Triage Status</th>
                                    <th className="px-10 py-6 text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Records...</p>
                                        </div>
                                    </td></tr>
                                ) : filteredAppointments.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-bold italic">No matching clinical records found.</td></tr>
                                ) : filteredAppointments.map((appt, idx) => (
                                    <motion.tr
                                        key={appt._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-indigo-50/30 transition-all group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-black text-lg border border-white shadow-sm ring-4 ring-slate-50 group-hover:ring-indigo-100 transition-all overflow-hidden">
                                                    {appt.patient?.profileImage ? (
                                                        <img src={getImageUrl(appt.patient.profileImage)} alt="Patient" className="w-full h-full object-cover" />
                                                    ) : (
                                                        appt.patient?.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-[900] text-slate-900 text-lg leading-none mb-1">{appt.patient?.name}</p>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">UID: {appt._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-black text-sm flex items-center gap-2 mb-1">
                                                    <Calendar size={14} className="text-indigo-500" />
                                                    {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-slate-400 font-bold text-xs flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="max-w-xs">
                                                <p className="text-sm text-slate-600 font-bold leading-relaxed line-clamp-2">{appt.reason || 'Routine Consultation / System Referral'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm inline-block ${appt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                appt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-slate-100 text-slate-400 border border-slate-200'
                                                }`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <AnimatePresence mode="wait">
                                                {appt.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedApt(appt);
                                                                setShowReportModal(true);
                                                            }}
                                                            className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                            title="Create Report"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(appt._id, 'confirmed')}
                                                            className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-sm border border-emerald-100 group/btn"
                                                            title="Authorize"
                                                        >
                                                            <Check size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(appt._id, 'cancelled')}
                                                            className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm border border-rose-100 group/btn"
                                                            title="Dismiss"
                                                        >
                                                            <X size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    </div>

                                                ) : appt.status === 'confirmed' ? (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedApt(appt);
                                                                setShowReportModal(true);
                                                            }}
                                                            className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                            title="Create Medical Report"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(appt._id, 'completed')}
                                                            className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                                        >
                                                            Done
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/video-call/${appt._id}`)}
                                                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group/btn"
                                                        >
                                                            <Video size={14} className="group-hover/btn:scale-110 transition-transform" /> Join
                                                        </button>
                                                    </div>

                                                ) : appt.status === 'completed' ? (
                                                    <div className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200">
                                                        <Check size={14} /> Done
                                                    </div>
                                                ) : (
                                                    <button className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-slate-200 group/btn">
                                                        <MoreVertical size={20} />
                                                    </button>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredAppointments.length} of {appointments.length} Consultations</p>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 cursor-not-allowed">Previous</button>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:border-indigo-500 transition-colors">Next Page</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Medical Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
                        >
                            <div className="bg-indigo-600 p-10 text-white relative">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black tracking-tight mb-2">Patient Report</h3>
                                    <p className="text-indigo-100 font-medium opacity-80">Submit clinical findings for {selectedApt?.patient?.name}.</p>
                                </div>
                            </div>

                            <form onSubmit={handleReportSubmit} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Clinical Diagnosis</label>
                                    <input
                                        type="text"
                                        required
                                        value={reportData.diagnosis}
                                        onChange={(e) => setReportData({ ...reportData, diagnosis: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                                        placeholder="e.g. Hypertension, Seasonal Flu..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Treatment Notes & Advice</label>
                                    <textarea
                                        required
                                        value={reportData.notes}
                                        onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all min-h-[150px]"
                                        placeholder="Add medications, diet plan, and follow-up clinical instructions..."
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowReportModal(false)}
                                        className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReport}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group flex-[2]"
                                    >
                                        {submittingReport ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>Submit to Vault <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorDashboard;
