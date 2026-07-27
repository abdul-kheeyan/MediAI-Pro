import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    Brain, FileSearch, Apple, Sparkles, ArrowLeft, Activity,
    RefreshCw, Star, ChevronRight, ChevronLeft, Download,
    User, Weight, Ruler, Heart, AlertCircle, Target,
    Salad, CheckCircle2, Copy, Check, Loader2,
    Flame, Dumbbell, Scale, Leaf, Beef, Sprout, Egg
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 8) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!text) { setDisplayed(''); setDone(false); return; }
        setDisplayed('');
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                setDone(true);
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    return { displayed, done };
}

// ─── Form Steps Config ────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Basic Info', icon: User },
    { id: 2, label: 'Health', icon: Heart },
    { id: 3, label: 'Goals', icon: Target },
];

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Light', desc: '1-3 days/week exercise' },
    { value: 'moderate', label: 'Moderate', desc: '3-5 days/week exercise' },
    { value: 'active', label: 'Active', desc: '6-7 days/week exercise' },
];

const GOALS = [
    { value: 'weight_loss', label: 'Weight Loss', icon: Flame },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell },
    { value: 'maintenance', label: 'Maintenance', icon: Scale },
    { value: 'general_health', label: 'General Health', icon: Heart },
];

const FOOD_PREFS = [
    { value: 'vegetarian', label: 'Vegetarian', icon: Leaf },
    { value: 'non_vegetarian', label: 'Non-Veg', icon: Beef },
    { value: 'vegan', label: 'Vegan', icon: Sprout },
    { value: 'eggetarian', label: 'Eggetarian', icon: Egg },
];

// ─── Input Component ──────────────────────────────────────────────────────────
const FormInput = ({ label, icon: Icon, ...props }) => (
    <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
        <div className="relative">
            {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
            <input
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 ${Icon ? 'pl-11 pr-4' : 'px-4'} text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all`}
                {...props}
            />
        </div>
    </div>
);

// ─── Pill Selector ────────────────────────────────────────────────────────────
const PillSelector = ({ options, value, onChange }) => (
    <div className="grid grid-cols-2 gap-3">
        {options.map(opt => {
            const Icon = opt.icon;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${value === opt.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'}`}
                >
                    {Icon && <Icon size={20} className={value === opt.value ? 'text-indigo-600' : 'text-slate-400'} />}
                    <div>
                        <p className="font-black text-xs">{opt.label}</p>
                        {opt.desc && <p className="text-[10px] text-slate-400 font-medium">{opt.desc}</p>}
                    </div>
                    {value === opt.value && <CheckCircle2 size={16} className="ml-auto text-indigo-500" />}
                </button>
            );
        })}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AIDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resultRef = useRef(null);
    const printTemplateRef = useRef(null);

    // Tab
    const [activeTab, setActiveTab] = useState(location.state?.reportText ? 'report' : 'diet');

    // Diet form state
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        weight: '', height: '', age: '',
        gender: '', activityLevel: '',
        medicalConditions: '', allergies: '',
        goal: '', foodPreference: '',
    });

    // Results
    const [dietPlan, setDietPlan] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [reportText, setReportText] = useState(location.state?.reportText || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Typewriter for diet plan
    const { displayed: dietDisplayed, done: dietDone } = useTypewriter(dietPlan, 6);
    const { displayed: reportDisplayed, done: reportDone } = useTypewriter(analysisResult, 6);

    const currentResult = activeTab === 'diet' ? dietDisplayed : reportDisplayed;
    const resultDone = activeTab === 'diet' ? dietDone : reportDone;
    const rawResult = activeTab === 'diet' ? dietPlan : analysisResult;

    const updateForm = (field, value) => setFormData(p => ({ ...p, [field]: value }));

    // ── Step Validation ──────────────────────────────────────────────────────
    const canProceed = () => {
        if (step === 1) return formData.weight && formData.height && formData.gender;
        if (step === 2) return true; // optional fields
        if (step === 3) return formData.goal && formData.foodPreference && formData.activityLevel;
        return false;
    };

    // ── Generate Diet Plan ───────────────────────────────────────────────────
    const requestDietPlan = async () => {
        setLoading(true);
        setError('');
        setDietPlan('');
        try {
            const { data } = await api.post('/ai-features/diet-plan', formData);
            setDietPlan(data.dietPlan);
            setAnalysisResult('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate diet plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Analyze Report ───────────────────────────────────────────────────────
    const requestAnalysis = async () => {
        if (!reportText.trim()) return setError('Please paste your lab report text first.');
        setLoading(true);
        setError('');
        setAnalysisResult('');
        try {
            const { data } = await api.post('/ai-features/analyze-report', { reportText });
            setAnalysisResult(data.analysis);
            setDietPlan('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Copy to Clipboard ────────────────────────────────────────────────────
    const handleCopy = () => {
        navigator.clipboard.writeText(rawResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Export PDF ───────────────────────────────────────────────────────────
    const handleExportPDF = async () => {
        if (!printTemplateRef.current || !rawResult) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(printTemplateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPos = 0;
            while (yPos < pdfHeight) {
                if (yPos > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -yPos, pdfWidth, pdfHeight);
                yPos += pageHeight;
            }
            const title = activeTab === 'diet' ? 'MediAI_Diet_Plan' : 'MediAI_Report_Analysis';
            pdf.save(`${title}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`);
        } catch (e) {
            console.error('PDF export error:', e);
        } finally {
            setExporting(false);
        }
    };

    const hasResult = dietPlan || analysisResult;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-5 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-[1rem] text-slate-500 transition-all border border-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-[1000] text-slate-900 tracking-tight leading-none flex items-center gap-2">
                                MediAI Insight <Sparkles className="text-amber-400" size={20} fill="currentColor" />
                            </h1>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Personalized Intelligence Hub</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                {/* ── Tab Switcher ─────────────────────────────────────── */}
                <div className="flex gap-3 mb-10 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                    {[
                        { key: 'diet', icon: Apple, label: 'Nutrition AI' },
                        { key: 'report', icon: FileSearch, label: 'Report Analyst' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setError(''); }}
                            className={`flex items-center gap-2.5 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.key
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ── Left Panel ────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'diet' ? (
                                <motion.div
                                    key="diet-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                                >
                                    {/* Step Progress Bar */}
                                    <div className="px-8 pt-8 pb-6 border-b border-slate-50">
                                        <div className="flex items-center justify-between mb-4">
                                            {STEPS.map((s, i) => (
                                                <React.Fragment key={s.id}>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step > s.id ? 'bg-emerald-500 text-white' : step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                                                            {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider ${step === s.id ? 'text-indigo-600' : 'text-slate-400'}`}>{s.label}</span>
                                                    </div>
                                                    {i < STEPS.length - 1 && (
                                                        <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form Steps */}
                                    <div className="px-8 py-6">
                                        <AnimatePresence mode="wait">
                                            {/* Step 1: Basic Info */}
                                            {step === 1 && (
                                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                                    <div>
                                                        <h3 className="text-xl font-[1000] text-slate-900 mb-1">Basic Info</h3>
                                                        <p className="text-xs text-slate-400 font-medium">Tell us about yourself</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput label="Weight (kg)" icon={Weight} type="number" placeholder="e.g. 70" value={formData.weight} onChange={e => updateForm('weight', e.target.value)} />
                                                        <FormInput label="Height (cm)" icon={Ruler} type="number" placeholder="e.g. 170" value={formData.height} onChange={e => updateForm('height', e.target.value)} />
                                                    </div>
                                                    <FormInput label="Age (years)" icon={User} type="number" placeholder="e.g. 25" value={formData.age} onChange={e => updateForm('age', e.target.value)} />
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Gender</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {['Male', 'Female', 'Other'].map(g => (
                                                                <button key={g} type="button" onClick={() => updateForm('gender', g)}
                                                                    className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${formData.gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}`}>
                                                                    {g}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Step 2: Health Info */}
                                            {step === 2 && (
                                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                                    <div>
                                                        <h3 className="text-xl font-[1000] text-slate-900 mb-1">Health Info</h3>
                                                        <p className="text-xs text-slate-400 font-medium">Optional but improves accuracy</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Medical Conditions</label>
                                                        <textarea
                                                            rows={3}
                                                            placeholder="e.g. Diabetes, High BP, Thyroid..."
                                                            value={formData.medicalConditions}
                                                            onChange={e => updateForm('medicalConditions', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Food Allergies</label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="e.g. Lactose, Gluten, Nuts..."
                                                            value={formData.allergies}
                                                            onChange={e => updateForm('allergies', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
                                                        />
                                                    </div>
                                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                                                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">These fields are optional. If you do not have any existing medical conditions, you can skip this step.</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Step 3: Goals */}
                                            {step === 3 && (
                                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                                    <div>
                                                        <h3 className="text-xl font-[1000] text-slate-900 mb-1">Goals & Lifestyle</h3>
                                                        <p className="text-xs text-slate-400 font-medium">Almost done!</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Your Goal</label>
                                                        <PillSelector options={GOALS} value={formData.goal} onChange={v => updateForm('goal', v)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Food Preference</label>
                                                        <PillSelector options={FOOD_PREFS} value={formData.foodPreference} onChange={v => updateForm('foodPreference', v)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Activity Level</label>
                                                        <PillSelector options={ACTIVITY_LEVELS} value={formData.activityLevel} onChange={v => updateForm('activityLevel', v)} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="px-8 pb-8 flex gap-3">
                                        {step > 1 && (
                                            <button onClick={() => setStep(s => s - 1)}
                                                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                                                <ChevronLeft size={16} /> Back
                                            </button>
                                        )}
                                        {step < 3 ? (
                                            <button
                                                onClick={() => setStep(s => s + 1)}
                                                disabled={!canProceed()}
                                                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                                Next <ChevronRight size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={requestDietPlan}
                                                disabled={loading || !canProceed()}
                                                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                                {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} fill="currentColor" /> Generate Plan</>}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                // ── Report Analyst Panel ─────────────────────
                                <motion.div
                                    key="report-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
                                >
                                    <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                        <FileSearch size={28} />
                                    </div>
                                    <h3 className="text-2xl font-[1000] text-slate-900 mb-2 tracking-tight">Report AI</h3>
                                    <p className="text-slate-500 font-medium mb-6 text-sm leading-relaxed">
                                        Paste the text from your laboratory report. The AI will explain complex medical jargon in clear, easy-to-understand language.
                                    </p>
                                    <textarea
                                        value={reportText}
                                        onChange={e => setReportText(e.target.value)}
                                        placeholder="Paste your laboratory report text here..."
                                        rows={8}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all font-medium text-sm text-slate-600 resize-none"
                                    />
                                    <button
                                        onClick={requestAnalysis}
                                        disabled={loading || !reportText.trim()}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} fill="currentColor" /> Analyze Report</>}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Premium Badge */}
                        <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 p-6 opacity-10"><Star size={80} fill="currentColor" /></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain size={18} className="text-indigo-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Powered by Gemini AI</span>
                                </div>
                                <h4 className="text-lg font-black mb-2 tracking-tight">Clinical Grade AI</h4>
                                <p className="text-indigo-200 text-xs font-medium leading-relaxed opacity-80">
                                    Generates a personalized and highly accurate diet plan tailored to your unique health metrics and goals.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Result Panel ──────────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px] flex flex-col items-center justify-center gap-6 p-12">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center">
                                            <Brain size={36} className="text-indigo-400" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Loader2 size={14} className="text-white animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-xl font-black text-slate-800 mb-2">AI Processing...</h4>
                                        <p className="text-sm text-slate-400 font-medium">Analyzing your health data...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </motion.div>
                            ) : !hasResult ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="bg-white/60 border-2 border-dashed border-slate-200 rounded-[2.5rem] min-h-[600px] flex flex-col items-center justify-center p-16 text-center">
                                    <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                                        <Brain size={40} className="text-slate-300" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-300 tracking-tight">System Ready</h4>
                                    <p className="text-slate-400 font-medium max-w-xs mt-2 text-xs uppercase tracking-[0.2em]">
                                        {activeTab === 'diet' ? 'Fill out the form and generate your plan' : 'Paste your report and start the analysis'}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                    {/* Result Header */}
                                    <div className="flex items-center justify-between px-10 py-7 border-b border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-100">
                                                <Activity size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">
                                                    {activeTab === 'diet' ? 'Nutrition Protocol' : 'Clinical Summary'}
                                                </h4>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500">Generated by MediAI • Gemini</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Copy Button */}
                                            <button onClick={handleCopy} title="Copy"
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 hover:border-indigo-200">
                                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                            </button>
                                            {/* Export PDF Button */}
                                            <button onClick={handleExportPDF} disabled={exporting || !resultDone} title="Export PDF"
                                                className="flex items-center gap-2 px-4 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-200">
                                                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                                {exporting ? 'Exporting...' : 'PDF'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Result Content with Markdown */}
                                    <div ref={resultRef} className="px-10 py-8 min-h-[500px]">
                                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-800 prose-h2:text-lg prose-h3:text-base prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-800 prose-strong:font-black">
                                            <ReactMarkdown>{currentResult}</ReactMarkdown>
                                        </div>
                                        {!resultDone && (
                                            <span className="inline-block w-2 h-5 bg-indigo-400 rounded ml-1 animate-pulse" />
                                        )}
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="px-10 py-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-center gap-2">
                                        <AlertCircle size={14} className="text-slate-400 shrink-0" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                            Medical Disclaimer: MediAI results are for informational purposes only. Always consult a qualified healthcare professional.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Hidden Print Template for PDF Export */}
            <div 
                ref={printTemplateRef} 
                style={{ 
                    position: 'absolute', 
                    left: '-9999px', 
                    top: '0', 
                    width: '800px', 
                    padding: '50px 60px', 
                    background: '#ffffff',
                    color: '#1e293b',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                {/* PDF Header Band */}
                <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center', borderBottom: '3px solid #4f46e5', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#4f46e5', margin: '0', letterSpacing: '-0.03em' }}>MediAI Insight</h1>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: '800', color: '#64748b', margin: '4px 0 0 0' }}>Clinical Nutrition & Diagnostics</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: '0' }}>Date: {new Date().toLocaleDateString('en-IN')}</p>
                        <p style={{ fontSize: '9px', color: '#64748b', margin: '3px 0 0 0', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>
                            Report ID: MEDI-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Patient Profile Card (Only for Diet Tab) */}
                {activeTab === 'diet' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '30px' }}>
                        <div>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Patient Age</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{formData.age ? `${formData.age} years` : 'Not specified'}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Gender</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{formData.gender || 'Not specified'}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Physical Stats</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                                {formData.weight ? `${formData.weight} kg` : ''} {formData.height ? ` / ${formData.height} cm` : 'Not specified'}
                            </span>
                        </div>
                        <div style={{ gridColumn: 'span 3', height: '1px', background: '#e2e8f0', margin: '5px 0' }}></div>
                        <div>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Primary Goal</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#4f46e5', textTransform: 'capitalize' }}>
                                {formData.goal ? formData.goal.replace('_', ' ') : 'General Health'}
                            </span>
                        </div>
                        <div>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Diet Preference</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', textTransform: 'capitalize' }}>
                                {formData.foodPreference || 'No preference'}
                            </span>
                        </div>
                        <div>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Activity Level</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', textTransform: 'capitalize' }}>
                                {formData.activityLevel || 'Not specified'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Styled Markdown Output */}
                <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.7' }}>
                    <ReactMarkdown>{rawResult}</ReactMarkdown>
                </div>

                {/* PDF Footer */}
                <div style={{ borderTop: '2px solid #e2e8f0', marginTop: '50px', paddingTop: '20px', textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                    Medical Disclaimer: MediAI results are for informational purposes only. Please consult a clinician before starting any diet.
                </div>
            </div>
        </div>
    );
};

export default AIDashboard;
