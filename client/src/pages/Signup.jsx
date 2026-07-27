import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Activity, CheckCircle2, Store } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [shopName, setShopName] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (role === 'pharmacy' && !shopName.trim()) {
            setError('Please enter your pharmacy/shop name');
            return;
        }
        try {
            await register(name, email, password, role, shopName);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-premium overflow-hidden border border-slate-100 relative z-10"
            >
                {/* Visual Side */}
                <div className="premium-gradient p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                    <div className="absolute bottom-0 right-0 p-8 opacity-10">
                        <Activity size={240} />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                                <Activity className="text-white" size={32} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">MediAI <span className="text-indigo-200">Pro</span></span>
                        </div>

                        <h2 className="text-5xl font-extrabold leading-tight mb-6">
                            Join the <br />
                            <span className="text-indigo-200">Revolution.</span>
                        </h2>
                        <p className="text-indigo-100 text-lg opacity-80 max-w-sm">
                            Get access to top-tier doctors and AI-driven insights for your health.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="bg-indigo-500/30 p-2 rounded-xl">
                                <CheckCircle2 size={18} className="text-indigo-200" />
                            </div>
                            <span className="text-sm font-bold">24/7 AI Health Assistant</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="bg-indigo-500/30 p-2 rounded-xl">
                                <CheckCircle2 size={18} className="text-indigo-200" />
                            </div>
                            <span className="text-sm font-bold">Secure Medical Data Vault</span>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-12">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-900 mb-2">Create Account</h3>
                        <p className="text-slate-500">Sign up in less than 2 minutes</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'patient', label: 'Patient', Icon: User },
                                { value: 'doctor', label: 'Doctor', Icon: Activity },
                                { value: 'pharmacy', label: 'Pharmacy', Icon: Store },
                            ].map(({ value, label, Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRole(value)}
                                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 relative ${role === value
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    <Icon size={22} className={role === value ? 'text-indigo-600' : 'text-slate-400'} />
                                    <span className="font-bold text-xs tracking-widest uppercase">{label}</span>
                                    {role === value && <CheckCircle2 size={14} className="absolute top-2 right-2 text-indigo-600" />}
                                </button>
                            ))}
                        </div>

                        {/* Shop Name field for pharmacy */}
                        {role === 'pharmacy' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Shop / Pharmacy Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Store size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="e.g. City Medicals"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary"
                        >
                            <UserPlus size={20} />
                            Create Free Account
                        </button>

                        <p className="pt-6 text-center text-slate-500">
                            Already part of MediAI?{' '}
                            <Link to="/login" className="text-indigo-600 font-black hover:text-indigo-700 underline-offset-4 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
