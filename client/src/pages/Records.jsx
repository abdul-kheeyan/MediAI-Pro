import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, Pill, Search, Filter, ArrowLeft, ChevronRight, Activity, Plus, X, Upload, Loader2, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Records = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newRecord, setNewRecord] = useState({
        diagnosis: '',
        notes: '',
        file: null
    });
    const [analyzingId, setAnalyzingId] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/records');
            setRecords(data);
        } catch {
            console.error('Error fetching records');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newRecord.file) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('diagnosis', newRecord.diagnosis);
        formData.append('notes', newRecord.notes);
        formData.append('file', newRecord.file);

        try {
            await api.post('/records', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowUploadModal(false);
            setNewRecord({ diagnosis: '', notes: '', file: null });
            fetchRecords();
            toast.success('Record uploaded successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const filteredRecords = records.filter(record =>
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAnalyze = async (recordId, diagnosis, notes) => {
        setAnalyzingId(recordId);
        try {
            const { data } = await api.post(`/records/${recordId}/analyze`);
            toast.success(`AI Insight: ${data.analysis}`, { duration: 5000 });
            fetchRecords();
        } catch (error) {
            console.error('AI Analysis failed, falling back to manual analysis');
            navigate('/ai-dashboard', { state: { reportText: `${diagnosis} ${notes}` } });
        } finally {
            setAnalyzingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-[1rem] text-slate-500 transition-all border border-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-[900] text-slate-900 tracking-tight leading-none">Health Vault</h1>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Medical Records Archive</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary py-3 rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <Plus size={18} /> Upload Report
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                {/* Search & Filter - Professional Look */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="relative flex-1 group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search clinical diagnoses, doctor names, or medicine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-[1.8rem] pl-16 pr-8 py-5 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-premium transition-all text-sm font-medium"
                        />
                    </div>
                    <button className="bg-white border border-slate-200 px-8 py-5 rounded-[1.8rem] text-slate-900 hover:bg-slate-50 flex items-center gap-3 shadow-premium transition-all font-black text-xs uppercase tracking-widest group">
                        <Filter size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" /> Filter Archive
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText className="text-indigo-600/30" size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Retreiving Vault...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-premium"
                    >
                        <div className="bg-slate-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100/50">
                            <FileText size={56} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Vault Empty</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                            No matching clinical records found. Your digital health history will reside here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {filteredRecords.map((record, idx) => (
                            <motion.div
                                key={record._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium hover:border-indigo-100 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none">
                                    <Activity size={120} />
                                </div>

                                <div className="flex justify-between items-start mb-8">
                                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                        <FileText size={28} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated On</p>
                                        <div className="flex items-center gap-2 justify-end text-slate-900 font-black text-sm">
                                            <Calendar size={14} className="text-indigo-400" />
                                            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Clinical Diagnosis</span>
                                    </div>
                                    <h4 className="text-2xl font-[900] text-slate-900 mb-2 tracking-tight">{record.diagnosis || 'Standard Consultation'}</h4>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                            {record.doctor?.profileImage ? (
                                                <img src={getImageUrl(record.doctor.profileImage)} alt="Doctor" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`https://ui-avatars.com/api/?name=${record.doctor?.name || 'Doctor'}&background=f1f5f9&color=64748b&bold=true`} alt="Doctor" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                            Dr. {record.doctor?.name}
                                        </p>
                                    </div>
                                </div>

                                {record.notes && (
                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Treatment Notes & Advice</p>
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-600 text-sm font-medium leading-relaxed italic">
                                            "{record.notes}"
                                        </div>
                                    </div>
                                )}

                                {record.prescription && record.prescription.length > 0 && (
                                    <div className="bg-slate-50/50 rounded-[1.8rem] p-6 mb-8 border border-slate-100">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="bg-white p-2 rounded-xl shadow-sm">
                                                <Pill size={16} className="text-indigo-600" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">Medication Protocol</span>
                                        </div>
                                        <div className="space-y-4">
                                            {record.prescription.slice(0, 2).map((p, pIdx) => (
                                                <div key={pIdx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 group-hover:border-indigo-100/50 transition-colors">
                                                    <span className="font-black text-slate-800 text-sm tracking-tight">{p.medicine}</span>
                                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black">{p.dosage}</span>
                                                </div>
                                            ))}
                                            {record.prescription.length > 2 && (
                                                <div className="text-center pt-2">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">+{record.prescription.length - 2} Additional Compounds</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-6 mt-2 border-t border-slate-50">
                                    <button
                                        onClick={() => navigate('/ai-dashboard')}
                                        className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                    >
                                        View Details <ChevronRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleAnalyze(record._id, record.diagnosis, record.notes)}
                                        disabled={analyzingId === record._id}
                                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-indigo-100 disabled:opacity-50"
                                    >
                                        {analyzingId === record._id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <><Brain size={14} /> Analyze with AI</>
                                        )}
                                    </button>
                                    {record.attachments && record.attachments.map((file, fIdx) => (
                                        <a
                                            key={fIdx}
                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                                        >
                                            <Download size={22} />
                                        </a>
                                    ))}
                                    {(!record.attachments || record.attachments.length === 0) && (
                                        <button disabled className="w-14 h-14 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-200 cursor-not-allowed">
                                            <Download size={22} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
                        >
                            <div className="premium-gradient p-10 text-white relative">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black tracking-tight mb-2">Digitize Record</h3>
                                    <p className="text-indigo-100 font-medium opacity-80">Add medical reports to your secure health vault.</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpload} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Report Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRecord.diagnosis}
                                        onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                                        className="input-field py-5"
                                        placeholder="e.g., Blood Test Report - Feb 2026"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Clinical Notes (Optional)</label>
                                    <textarea
                                        value={newRecord.notes}
                                        onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                                        className="input-field py-5 min-h-[120px]"
                                        placeholder="Add any context or doctor instructions..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">File Attachment</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            required
                                            accept=".pdf,image/*"
                                            onChange={(e) => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="w-full flex items-center justify-between bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white p-3 rounded-xl shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                    <Upload size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{newRecord.file ? newRecord.file.name : 'Select PDF or Image'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">Max size 5MB</p>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Browse</div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="btn-primary flex-[2] relative overflow-hidden group shadow-indigo-200/50"
                                    >
                                        {uploading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Activity size={20} />
                                                Securely Upload
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

export default Records;
