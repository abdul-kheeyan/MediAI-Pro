import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Phone, Activity, Heart,
    ArrowLeft, ShieldAlert, Zap, HelpCircle,
    ChevronRight, MapPin, ExternalLink, Siren
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmergencyGuidance = () => {
    const navigate = useNavigate();

    const emergencies = [
        {
            title: 'Critical Cardiac Distress',
            steps: [
                'Authorize emergency services (911 / 112) immediately.',
                'Administer 325mg Aspirin (chewable) if subject is non-allergic.',
                'Secure subject in a seated or supine position to maximize oxygen flow.',
                'Initiate CPR protocols if subject loses consciousness/respiratory function.'
            ],
            icon: <Heart size={32} />,
            color: 'red',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            accent: 'text-rose-600'
        },
        {
            title: 'Respiratory Instability',
            steps: [
                'Establish immediate contact with medical tactical units.',
                'Locate and deploy subject\'s prescribed rescue bronchodilator.',
                'Optimize airway posture by maintaining an upright, calm seated position.',
                'Eliminate restrictive apparel around the thoracic region.'
            ],
            icon: <Activity size={32} />,
            color: 'blue',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            accent: 'text-indigo-600'
        },
        {
            title: 'Hypovolemic Hemorrhaging',
            steps: [
                'Exert sustained, high-pressure compression using sterile substrate.',
                'Elevate target trauma site above cardiac level if possible.',
                'Maintain constant pressure until official medical interception.',
                'Coordinate with emergency dispatch for uncontrolled hemorrhage.'
            ],
            icon: <ShieldAlert size={32} />,
            color: 'orange',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            accent: 'text-orange-600'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
            {/* Urgent Header */}
            <header className="bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 text-white px-6 py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Siren size={200} className="rotate-12" />
                </div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-rose-50 transition-all mb-10 font-black text-xs uppercase tracking-widest border border-white/10 shadow-lg"
                    >
                        <ArrowLeft size={16} /> Dashboard Portal
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-200">Emergency Protocol Engine v4.0</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-[900] mb-6 tracking-tight flex items-center gap-4 leading-tight">
                        <AlertTriangle className="text-white/40" size={48} /> Life Critical <br className="hidden sm:block" /> Guidance
                    </h1>
                    <p className="text-rose-100 text-lg max-w-2xl font-medium leading-relaxed opacity-90">
                        Synthesized tactical responses for acute medical scenarios. <br />
                        <span className="font-black text-white underline decoration-rose-400">If active emergency: Dial 911 immediately.</span>
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto -mt-12 p-6 md:p-10 relative z-20">
                <div className="grid grid-cols-1 gap-10">
                    {emergencies.map((e, idx) => (
                        <motion.section
                            key={e.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="bg-white rounded-[3rem] shadow-premium border border-slate-100/50 overflow-hidden group hover:border-rose-200 transition-all duration-500"
                        >
                            <div className="p-10 md:p-12">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className={`${e.bg} ${e.accent} w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner border ${e.border} group-hover:scale-110 transition-transform duration-700`}>
                                            {e.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-[900] text-slate-900 tracking-tight leading-none mb-2">{e.title}</h2>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Triage Level: Life Critical</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Response Time</span>
                                        <span className="text-xl font-black text-slate-900 leading-none">IMMEDIATE</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <ul className="space-y-6">
                                        {e.steps.map((step, i) => (
                                            <li key={i} className="flex gap-5 group/item">
                                                <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover/item:bg-rose-500 group-hover/item:text-white group-hover/item:border-rose-500 transition-all">
                                                    0{i + 1}
                                                </div>
                                                <p className="text-slate-700 font-bold pt-2 leading-relaxed text-sm">
                                                    {step}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-center items-center text-center">
                                        <Zap className="text-rose-500 mb-6" size={48} />
                                        <h4 className="text-lg font-black text-slate-900 mb-2">Protocol Authorization</h4>
                                        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                                            These steps are derived from clinical triage standards. Seek professional assistance immediately.
                                        </p>
                                        <button className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
                                            <MapPin size={16} /> Locate Nearest Trauma Center
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
                    <section className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
                        <h3 className="text-2xl font-[900] text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                            <Phone className="text-indigo-600" size={28} /> Critical Contact Matrix
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Dispatch / Rescue</p>
                                    <p className="text-4xl font-black text-rose-600 leading-none">911</p>
                                </div>
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-md">
                                    <Phone size={24} />
                                </div>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Poison / Toxicology</p>
                                    <p className="text-3xl font-black text-indigo-600 leading-none tracking-tight">800-222-1222</p>
                                </div>
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-md">
                                    <Phone size={24} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="space-y-8 flex flex-col justify-between">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 flex flex-col gap-6">
                            <HelpCircle className="opacity-40" size={32} />
                            <div>
                                <p className="text-lg font-black leading-tight mb-2 tracking-tight">Non-Critical <br /> Assistance?</p>
                                <p className="text-xs text-indigo-100 font-medium opacity-80 leading-relaxed mb-6">
                                    Use our AI Symptom Engine for real-time triage analysis and risk scoring.
                                </p>
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
                                >
                                    Access AI Chat <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Zap className="text-amber-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">External Sync</p>
                                    <p className="font-bold text-sm">Medical Records</p>
                                </div>
                            </div>
                            <ExternalLink size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmergencyGuidance;
