import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Activity } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-premium overflow-hidden border border-slate-100 relative z-10"
            >
                {/* Branding Side */}
                <div className="premium-gradient p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Activity size={240} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                                <Activity className="text-white" size={32} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">MediAI <span className="text-indigo-200">Pro</span></span>
                        </div>

                        <h2 className="text-5xl font-extrabold leading-tight mb-6">
                            Intelligent Care for <br />
                            <span className="text-indigo-200">Modern Living.</span>
                        </h2>
                        <p className="text-indigo-100 text-lg opacity-80 max-w-sm">
                            Experience the next generation of healthcare management powered by AI.
                        </p>
                    </div>

                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                        <p className="text-sm font-medium mb-4">"The symptom checker helped me understand my condition before even seeing a doctor. Truly amazing!"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 overflow-hidden border-2 border-white/20">
                                <img src={`https://ui-avatars.com/api/?name=Sarah+J&background=6366f1&color=fff`} alt="User" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Sarah Jamison</p>
                                <p className="text-xs text-indigo-300">Verified Patient</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-16 flex flex-col justify-center">
                    <div className="mb-10 lg:hidden flex justify-center">
                        <div className="bg-indigo-600 p-3 rounded-2xl mb-4">
                            <Activity className="text-white" size={32} />
                        </div>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h3>
                        <p className="text-slate-500">Sign in to manage your health journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest leading-none">Email Address</label>
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
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest leading-none">Password</label>
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

                        <div className="flex items-center justify-between py-2 ml-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-indigo-600 font-bold hover:underline">Forgot?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary"
                        >
                            <LogIn size={20} />
                            Sign In to Account
                        </button>

                        <div className="pt-8 text-center">
                            <p className="text-slate-500">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-indigo-600 font-black hover:text-indigo-700 underline-offset-4 hover:underline">
                                    Create one for free
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
