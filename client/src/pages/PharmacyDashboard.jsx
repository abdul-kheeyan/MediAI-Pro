import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Plus, Trash2, Edit3, X, LogOut,
    AlertCircle, CheckCircle2, Loader2, Store, Calendar,
    Pill, ShoppingBag, Tag, ToggleLeft, ToggleRight,
    ChevronRight, ArrowLeft, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const CATEGORIES = ['OTC', 'Clinical', 'Supplements', 'Equipment', 'Generic'];

const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: 'OTC',
    stock: '',
    manufacturer: '',
    prescriptionRequired: false,
    expiryDate: ''
};

const PharmacyDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchMyProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/pharmacy/my-products');
            setProducts(data);
        } catch (error) {
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            manufacturer: product.manufacturer || '',
            prescriptionRequired: product.prescriptionRequired,
            expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingProduct) {
                const { data } = await api.put(`/pharmacy/products/${editingProduct._id}`, form);
                setProducts(products.map(p => p._id === data._id ? data : p));
                showToast('Medicine updated successfully!');
            } else {
                const { data } = await api.post('/pharmacy/products', form);
                setProducts([data, ...products]);
                showToast('Medicine added to shop!');
            }
            setShowModal(false);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save product', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this medicine?')) return;
        try {
            await api.delete(`/pharmacy/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            showToast('Medicine removed from shop');
        } catch (error) {
            showToast('Failed to delete medicine', 'error');
        }
    };

    const toggleActive = async (product) => {
        try {
            const { data } = await api.put(`/pharmacy/products/${product._id}`, {
                isActive: !product.isActive
            });
            setProducts(products.map(p => p._id === data._id ? data : p));
            showToast(`Medicine ${data.isActive ? 'listed' : 'unlisted'} in shop`);
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const activeCount = products.filter(p => p.isActive).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 font-sans">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-100/60 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Store className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-none">
                                {user?.shopName || 'My Pharmacy'}
                            </h1>
                            <p className="text-xs text-emerald-600 font-bold mt-0.5 uppercase tracking-wider">Pharmacy Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div
                            onClick={() => navigate('/profile')}
                            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group cursor-pointer hover:border-emerald-200 transition-all overflow-hidden"
                        >
                            {user?.profileImage ? (
                                <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Package size={18} className="group-hover:text-emerald-500 transition-colors" />
                            )}
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-semibold"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: 'Total Medicines', value: products.length, icon: Pill, color: 'emerald' },
                        { label: 'Listed in Shop', value: activeCount, icon: ShoppingBag, color: 'teal' },
                        { label: 'Total Stock Units', value: totalStock.toLocaleString(), icon: Package, color: 'green' }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-100 flex items-center justify-center`}>
                                <stat.icon className={`text-${stat.color}-600`} size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
                        <h2 className="text-lg font-black text-slate-900">My Medicines</h2>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:shadow-xl transition-shadow"
                        >
                            <Plus size={18} />
                            Add Medicine
                        </motion.button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 size={36} className="animate-spin text-emerald-500" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Package size={56} className="mb-4 text-slate-200" />
                            <p className="text-xl font-bold mb-2">No medicines yet</p>
                            <p className="text-sm">Click "Add Medicine" to start listing your stock</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-8 py-4">Medicine</th>
                                        <th className="px-4 py-4">Category</th>
                                        <th className="px-4 py-4">Price</th>
                                        <th className="px-4 py-4">Stock</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-8 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {products.map((product, i) => (
                                        <motion.tr
                                            key={product._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                                                    <div className="flex gap-3 mt-1">
                                                        {product.manufacturer && (
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                                                <Store size={10} /> {product.manufacturer}
                                                            </span>
                                                        )}
                                                        {product.expiryDate && (
                                                            <span className={`text-[10px] font-black uppercase tracking-tight flex items-center gap-1 ${new Date(product.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))
                                                                ? 'text-amber-500' : 'text-slate-400'
                                                                }`}>
                                                                <Calendar size={10} /> Exp: {new Date(product.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {product.prescriptionRequired && (
                                                        <span className="inline-flex items-center mt-1 text-[10px] font-black text-red-500 uppercase tracking-wide">
                                                            <Tag size={10} className="mr-1" /> Rx Required
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="font-black text-slate-900">₹{product.price}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className={`font-bold text-sm ${product.stock < 20 ? 'text-red-500' : 'text-slate-700'}`}>
                                                    {product.stock} units
                                                </span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <button
                                                    onClick={() => toggleActive(product)}
                                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${product.isActive
                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {product.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                    {product.isActive ? 'Listed' : 'Unlisted'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 flex items-center justify-between">
                                <h2 className="text-xl font-black text-white">
                                    {editingProduct ? 'Edit Medicine' : 'Add New Medicine'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                                    <X size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                                {/* Name */}
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Medicine Name *</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="e.g. Paracetamol 500mg"
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Description *</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        required
                                        rows={2}
                                        placeholder="What is this medicine used for?"
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Price & Stock */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Price (₹) *</label>
                                        <input
                                            type="number" min="0" value={form.price}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            required placeholder="0"
                                            className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Stock (units) *</label>
                                        <input
                                            type="number" min="0" value={form.stock}
                                            onChange={e => setForm({ ...form, stock: e.target.value })}
                                            required placeholder="0"
                                            className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Category & Manufacturer */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white"
                                        >
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Manufacturer</label>
                                        <input
                                            value={form.manufacturer}
                                            onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                                            placeholder="Company name"
                                            className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Expiry Date</label>
                                    <input
                                        type="date" value={form.expiryDate}
                                        onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Prescription */}
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, prescriptionRequired: !form.prescriptionRequired })}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all w-full text-left ${form.prescriptionRequired
                                        ? 'bg-red-50 border-red-200 text-red-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                        }`}
                                >
                                    {form.prescriptionRequired ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                    <div>
                                        <p className="text-sm font-bold">Prescription Required</p>
                                        <p className="text-xs text-slate-400">Toggle if this medicine needs a doctor's prescription</p>
                                    </div>
                                </button>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add to Shop'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PharmacyDashboard;
