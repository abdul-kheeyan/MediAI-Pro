import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle2, ChevronRight, Plus, ArrowLeft, Loader2, Activity, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showBookModal, setShowBookModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [newAppointment, setNewAppointment] = useState({
        doctorId: '',
        date: '',
        reason: ''
    });

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [specialization]);

    // Body scroll lock
    useEffect(() => {
        if (showBookModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showBookModal]);


    // Handle debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [apptsRes, doctorsRes] = await Promise.all([
                api.get('/appointments'),
                api.get(`/auth/doctors?search=${search}&specialization=${specialization}`)
            ]);
            setAppointments(apptsRes.data);
            setDoctors(doctorsRes.data);
        } catch {
            console.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get(`/auth/doctors?search=${search}&specialization=${specialization}`);
            setDoctors(res.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };



    const handleBook = async (e) => {
        e.preventDefault();
        setBookingLoading(true);

        try {
            // Directly Book Appointment (Free Service)
            await api.post('/appointments', newAppointment);

            setShowBookModal(false);
            setNewAppointment({ doctorId: '', date: '', reason: '' });
            fetchData();
            toast.success('Appointment booked successfully! Our specialist will review it soon.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-[1rem] text-slate-500 transition-all border border-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-[900] text-slate-900 tracking-tight leading-none">Your Appointments</h1>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Healthcare Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBookModal(true)}
                        className="btn-primary py-3 rounded-2xl text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} /> New Appointment
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-10">
                {/* Stat Cards - Premium Version */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium hover:border-indigo-100 transition-all duration-500 group">
                        <div className="flex items-center gap-6">
                            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
                                <p className="text-4xl font-[1000] text-slate-900 tracking-tighter">{appointments.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium hover:border-emerald-100 transition-all duration-500 group">
                        <div className="flex items-center gap-6">
                            <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmed</p>
                                <p className="text-4xl font-[1000] text-slate-900 tracking-tighter">{appointments.filter(a => a.status === 'confirmed').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium hover:border-indigo-100 transition-all duration-500 group">
                        <div className="flex items-center gap-6">
                            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Clock size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Session</p>
                                <p className="text-sm font-black text-slate-900 tracking-tight">
                                    {appointments.find(a => a.status === 'confirmed') ? new Date(appointments.find(a => a.status === 'confirmed').date).toLocaleDateString() : 'None Scheduled'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="text-indigo-600/30" size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Synchronizing Data...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-premium"
                    >
                        <div className="bg-indigo-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Calendar size={48} className="text-indigo-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Appointments Found</h3>
                        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
                            It looks like you don't have any specialist consultations scheduled yet. Book your first one today.
                        </p>
                        <button
                            onClick={() => setShowBookModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 mx-auto"
                        >
                            <Plus size={20} /> Schedule Consultation
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map((appt, idx) => (
                            <motion.div
                                key={appt._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-indigo-100 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-xl leading-tight tracking-tight mb-1">
                                            Dr. {appt.doctor?.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                {appt.doctor?.specialization || 'General Specialist'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <Calendar size={14} className="text-indigo-400" />
                                                {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <Clock size={14} className="text-indigo-400" />
                                                {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-8 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${appt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            appt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                'bg-slate-50 text-slate-400 border border-slate-100'
                                            }`}>
                                            {appt.status}
                                        </span>
                                        {appt.doctor?._id && (
                                            <button
                                                onClick={() => navigate(`/doctor/${appt.doctor._id}`)}
                                                className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                                            >
                                                <ExternalLink size={11} /> View Profile
                                            </button>
                                        )}
                                    </div>
                                    <button className="w-12 h-12 flex items-center justify-center bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-all duration-300 text-slate-300">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {showBookModal && (
                    <div className="fixed inset-0 z-[100] overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowBookModal(false)}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 my-8"
                            >

                                <div className="premium-gradient p-10 text-white relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Calendar size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-black tracking-tight mb-2">Schedule Now</h3>
                                        <p className="text-indigo-100 font-medium opacity-80">Book a free consultation session with our medical panel.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleBook} className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Search Specialist</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Dr. Smith..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Specialization</label>
                                            <select
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                className="input-field appearance-none"
                                            >
                                                <option value="">All Categories</option>
                                                <option value="Cardiology">Cardiology</option>
                                                <option value="Dermatology">Dermatology</option>
                                                <option value="Neurology">Neurology</option>
                                                <option value="Pediatrics">Pediatrics</option>
                                                <option value="General Medicine">General Medicine</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Choice of Specialist</label>
                                            <div className="relative group">
                                                <select
                                                    required
                                                    value={newAppointment.doctorId}
                                                    onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                                                    className="input-field appearance-none"
                                                >
                                                    <option value="">Choose Specialist...</option>
                                                    {doctors.map(doc => (
                                                        <option key={doc._id} value={doc._id}>Dr. {doc.name} • {doc.specialization}</option>
                                                    ))}
                                                    {doctors.length === 0 && <option disabled>No doctors found matching filters</option>}
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronRight size={18} className="rotate-90" />
                                                </div>
                                            </div>
                                            {/* Doctor Cards — quick browse & profile link */}
                                            {doctors.length > 0 && (
                                                <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
                                                    {doctors.map(doc => (
                                                        <div
                                                            key={doc._id}
                                                            className={`flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${newAppointment.doctorId === doc._id
                                                                ? 'border-indigo-400 bg-indigo-50'
                                                                : 'border-slate-100 bg-slate-50 hover:border-indigo-200'
                                                                }`}
                                                            onClick={() => setNewAppointment({ ...newAppointment, doctorId: doc._id })}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                                    <User size={15} className="text-indigo-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900">Dr. {doc.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">{doc.specialization || 'General'}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/doctor/${doc._id}`); }}
                                                                className="flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest whitespace-nowrap"
                                                            >
                                                                <ExternalLink size={11} /> Profile
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Preferred Slot</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={newAppointment.date}
                                                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Clinical Concerns</label>
                                        <textarea
                                            rows="4"
                                            value={newAppointment.reason}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                                            className="input-field resize-none py-5"
                                            placeholder="Describe your symptoms or consultation goals..."
                                        ></textarea>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                                        <button
                                            type="button"
                                            onClick={() => setShowBookModal(false)}
                                            className="flex-1 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-transparent"
                                        >
                                            Return Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="btn-primary flex-[2] relative overflow-hidden group shadow-indigo-200/50"
                                        >
                                            {bookingLoading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    Confirm Session
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Appointments;
