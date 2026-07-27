import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, User, Star, MapPin, Phone, Mail,
    Activity, Calendar, Clock, Award, BookOpen,
    CheckCircle2, Loader2, Heart
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

const SPECIALIZATION_INFO = {
    'Cardiology': { icon: Heart, desc: 'Heart & Cardiovascular diseases', color: 'rose' },
    'Dermatology': { icon: Star, desc: 'Skin, hair & nail conditions', color: 'amber' },
    'Neurology': { icon: Activity, desc: 'Brain, spine & nervous system', color: 'purple' },
    'Pediatrics': { icon: User, desc: 'Child & adolescent healthcare', color: 'blue' },
    'General Medicine': { icon: BookOpen, desc: 'Primary care & general health', color: 'green' },
    'Orthopedics': { icon: Award, desc: 'Bones, joints & muscles', color: 'orange' },
};

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const { data } = await api.get(`/auth/doctors/${id}`);
                setDoctor(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load doctor profile');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-indigo-600" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <p className="text-slate-400 text-lg font-bold">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    const specInfo = SPECIALIZATION_INFO[doctor.specialization] || { icon: Activity, desc: 'Medical Specialist', color: 'indigo' };
    const SpecIcon = specInfo.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/10 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100/80 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-none">Doctor Profile</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">View specialist details</p>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
                >
                    {/* Gradient Banner */}
                    <div className="h-36 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-full bg-white"
                                    style={{
                                        width: `${60 + i * 30}px`,
                                        height: `${60 + i * 30}px`,
                                        top: `${-20 + i * 10}px`,
                                        right: `${i * 60}px`,
                                        opacity: 0.3
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-8 pb-8 relative">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-200 border-4 border-white -mt-12 mb-4 overflow-hidden">
                            {doctor.profileImage ? (
                                <img src={getImageUrl(doctor.profileImage)} alt={doctor.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={36} className="text-white" />
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dr. {doctor.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full bg-${specInfo.color}-500`} />
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        {doctor.specialization || 'General Specialist'}
                                    </p>
                                </div>
                                <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-lg">
                                    {doctor.bio || `Dr. ${doctor.name} is a qualified specialist providing expert medical care to patients. Committed to delivering high-quality healthcare with a patient-first approach.`}
                                </p>
                            </div>

                            {/* Book Now CTA */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/appointments')}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 whitespace-nowrap self-start"
                            >
                                <Calendar size={18} />
                                Book Appointment
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Specialization', value: doctor.specialization || 'General', icon: SpecIcon, color: specInfo.color },
                        { label: 'Status', value: 'Available', icon: CheckCircle2, color: 'emerald' },
                        { label: 'Consultation', value: 'Online + Video', icon: Activity, color: 'indigo' },
                        { label: 'Language', value: 'Hindi / English', icon: BookOpen, color: 'purple' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                                <stat.icon className={`text-${stat.color}-600`} size={18} />
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-sm font-black text-slate-900 mt-0.5">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Specialization Detail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl bg-${specInfo.color}-100 flex items-center justify-center`}>
                            <SpecIcon className={`text-${specInfo.color}-600`} size={18} />
                        </div>
                        Area of Expertise
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`bg-${specInfo.color}-50 rounded-2xl p-5 border border-${specInfo.color}-100`}>
                            <h4 className="font-black text-slate-900 text-lg">{doctor.specialization || 'General Medicine'}</h4>
                            <p className="text-slate-500 text-sm mt-1">{specInfo.desc}</p>
                        </div>

                        {/* Conditions Treated */}
                        <div className="space-y-3">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Common Conditions Treated</p>
                            {getConditions(doctor.specialization).map((condition, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 font-medium">{condition}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-6">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { icon: Mail, label: 'Email', value: doctor.email },
                            { icon: Phone, label: 'Phone', value: doctor.phone || 'Not provided' },
                            { icon: MapPin, label: 'Location', value: doctor.address || 'India' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <item.icon size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-800 mt-0.5 break-all">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Book CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Ready to Consult?</h3>
                        <p className="text-indigo-200 mt-1">Book a video or in-person session with Dr. {doctor.name}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/appointments')}
                        className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl whitespace-nowrap"
                    >
                        Book Now →
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

// Helper: return sample conditions based on specialization
const getConditions = (spec) => {
    const map = {
        'Cardiology': ['Hypertension', 'Heart failure', 'Arrhythmia', 'Coronary artery disease'],
        'Dermatology': ['Acne', 'Eczema', 'Psoriasis', 'Skin infections'],
        'Neurology': ['Epilepsy', 'Migraine', 'Parkinson\'s disease', 'Stroke'],
        'Pediatrics': ['Fever & infections', 'Growth disorders', 'Allergies', 'Vaccinations'],
        'General Medicine': ['Diabetes', 'Thyroid disorders', 'Infections', 'Preventive care'],
        'Orthopedics': ['Fractures', 'Arthritis', 'Back pain', 'Sports injuries'],
    };
    return map[spec] || ['General consultation', 'Preventive care', 'Health check-up', 'Follow-up visits'];
};

export default DoctorProfile;
