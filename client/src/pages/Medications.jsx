import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, Clock, Plus, Trash2, CheckCircle2,
    AlertCircle, ArrowLeft, Loader2, Calendar,
    ChevronRight, Bell, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Medications = () => {
    const [meds, setMeds] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '',
        dosage: '',
        frequency: 'Daily',
        time: ['08:00'],
        notes: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [medsRes, scriptsRes] = await Promise.all([
                api.get('/medications'),
                api.get('/prescriptions')
            ]);
            setMeds(medsRes.data);
            setPrescriptions(scriptsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMed = async (e) => {
        e.preventDefault();
        setBtnLoading(true);
        try {
            await api.post('/medications', newMed);
            setShowAddModal(false);
            setNewMed({ name: '', dosage: '', frequency: 'Daily', time: ['08:00'], notes: '' });
            fetchData();
            toast.success('Medication added successfully');
        } catch {
            toast.error('Failed to add medication');
        } finally {
            setBtnLoading(false);
        }
    };

    const deleteMed = async (id) => {
        if (!window.confirm('Are you sure you want to stop this medication reminder?')) return;
        try {
            await api.delete(`/medications/${id}`);
            fetchData();
            toast.success('Medication deleted successfully');
        } catch {
            toast.error('Failed to delete medication');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32 selection:bg-indigo-100">
            {/* Premium Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-[1rem] text-slate-500 transition-all border border-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-[900] text-slate-900 tracking-tight leading-none">Health Tracking</h1>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Medication Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary py-3 rounded-2xl text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} /> Schedule Reminder
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Pill className="text-indigo-600/30" size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Syncing Schedules...</p>
                    </div>
                ) : meds.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-premium"
                    >
                        <div className="bg-orange-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Pill size={48} className="text-orange-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Active Schedules</h3>
                        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
                            Your digital medicine cabinet is empty. Add your prescription schedules to receive automated clinical alerts.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 mx-auto"
                        >
                            <Plus size={20} /> Add First Entry
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {/* Clinical Prescriptions Section */}
                        {prescriptions.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
                                        <FileText size={20} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Prescriptions</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {prescriptions.map((script, idx) => (
                                        <motion.div
                                            key={script._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-indigo-200 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border-2 border-indigo-100 p-0.5">
                                                        <img src={`https://ui-avatars.com/api/?name=${script.doctor?.name}&background=f8fafc&color=4f46e5&bold=true`} alt="Doctor" className="rounded-full" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prescribed By</p>
                                                        <p className="text-xs font-black text-slate-900">Dr. {script.doctor?.name}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{new Date(script.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {script.medicines.map((med, mIdx) => (
                                                    <div key={mIdx} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{med.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500">{med.frequency} • {med.duration}</p>
                                                        </div>
                                                        <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-indigo-600 border border-slate-100">{med.dosage}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Manual Schedules Section */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-orange-600 p-3 rounded-2xl shadow-lg">
                                    <Pill size={20} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Schedules</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                                {meds.map((med, idx) => (
                                    <motion.div
                                        key={med._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium relative overflow-hidden group hover:border-indigo-100 transition-all duration-300"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[5rem] -mr-8 -mt-8 opacity-40 group-hover:scale-110 transition-transform duration-500"></div>

                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className="bg-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <Pill size={28} />
                                            </div>
                                            <button
                                                onClick={() => deleteMed(med._id)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all border border-transparent"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="relative z-10">
                                            <h4 className="text-2xl font-[900] text-slate-900 mb-1 tracking-tight">{med.name}</h4>
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-600">{med.dosage}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-3 mb-8">
                                                {med.time.map((t, i) => (
                                                    <div key={i} className="bg-slate-50 flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                                        <Clock size={14} className="text-indigo-500" /> {t}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{med.frequency}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Protocol Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Premium Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
                        >
                            <div className="premium-gradient p-10 text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Bell size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black tracking-tight mb-2">Clinical Reminder</h3>
                                    <p className="text-indigo-100 font-medium opacity-80">Sync your medication cycles with MediAI alerts.</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddMed} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Medication Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        value={newMed.name}
                                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                        className="input-field py-5"
                                        placeholder="e.g., Atorvastatin 40mg"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Measurement / Unit</label>
                                        <input
                                            type="text"
                                            required
                                            value={newMed.dosage}
                                            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                                            className="input-field py-5"
                                            placeholder="e.g., 1 Tablet"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cycle Frequency</label>
                                        <div className="relative group">
                                            <select
                                                value={newMed.frequency}
                                                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                                                className="input-field py-5 appearance-none"
                                            >
                                                <option>Daily</option>
                                                <option>Weekly</option>
                                                <option>As needed</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronRight size={18} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Daily Alert Window</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            required
                                            value={newMed.time[0]}
                                            onChange={(e) => setNewMed({ ...newMed, time: [e.target.value] })}
                                            className="input-field py-5 pl-14"
                                        />
                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Close Portal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={btnLoading}
                                        className="btn-primary flex-[2] relative overflow-hidden group shadow-indigo-200/50"
                                    >
                                        {btnLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <CheckCircle2 size={20} />
                                                Sync Schedule
                                            </>
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

export default Medications;
