import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ArrowLeft, Plus,
    Minus, X, CreditCard, ShieldCheck, Truck, Clock, Sparkles,
    Calendar, Store, Search, ShoppingCart, Pill, CheckCircle2, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Pharmacy = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

    const categories = ['All', 'OTC', 'Clinical', 'Supplements', 'Equipment'];

    useEffect(() => {
        fetchProducts();
    }, [category, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/pharmacy/products?category=${category}&search=${searchTerm}`);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            setCart(cart.map(item =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        toast.success('Added to cart');
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        const res = await loadRazorpay();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Check your internet connection.');
            return;
        }

        try {
            // 1. Create Order on Backend
            const { data: orderData } = await api.post('/payments/create-order', {
                amount: cartTotal,
                orderType: 'pharmacy',
                items: cart.map(item => ({
                    product: item._id,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
                amount: orderData.amount,
                currency: orderData.currency,
                name: "MediAI Pharmacy",
                description: `Purchase of ${cart.length} items`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    try {
                        // 2. Verify Payment
                        await api.post('/payments/verify', {
                            ...response,
                            dbOrderId: orderData.dbOrderId
                        });

                        setShowCart(false);
                        setCart([]);
                        toast.success('Order placed successfully! Delivery in 60 mins.');
                    } catch (error) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email
                },
                theme: {
                    color: "#10b981"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initialize payment');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
            {/* Pharmacy Navbar */}
            <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-8 py-5 flex items-center justify-between sticky top-0 z-[100]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xl font-[900] text-slate-900 tracking-tighter">MediAI <span className="text-emerald-600">Pharmacy</span></span>
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Premium Health Store</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search medications..."
                            className="bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm w-80 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowCart(true)}
                        className="relative p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ShoppingCart size={22} />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                {/* Hero Section */}
                <header className="mb-12 relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-16 opacity-10 blur-3xl pointer-events-none">
                        <Pill size={300} fill="currentColor" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-6 border border-emerald-500/30">
                            <Sparkles size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Authentic & Verified</span>
                        </div>
                        <h1 className="text-5xl font-black mb-6 tracking-tighter">Your Digital Health <span className="text-emerald-400 italic">Vault Store.</span></h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                            Order prescription medications, wellness supplements, and clinical equipment with doorstep delivery in 60 minutes.
                        </p>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                <span className="text-xs font-bold uppercase tracking-widest">100% Genuine</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Truck className="text-emerald-500" size={24} />
                                <span className="text-xs font-bold uppercase tracking-widest">Fast Delivery</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Categories */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${category === cat
                                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-500/10'
                                : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] h-[400px] animate-pulse"></div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 text-center">
                        <Pill size={64} className="text-slate-200 mb-6" />
                        <h2 className="text-xl font-black text-slate-900 mb-2">No medications found</h2>
                        <p className="text-slate-400 font-medium">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-emerald-100 transition-all duration-500"
                            >
                                <div className="relative h-48 bg-slate-50 overflow-hidden">
                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                    {product.prescriptionRequired && (
                                        <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck size={10} /> Needs Rx
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 border border-white/50">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{product.name}</h3>

                                    <div className="flex flex-col gap-1 mb-4">
                                        {product.manufacturer && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <Store size={10} /> {product.manufacturer}
                                            </div>
                                        )}
                                        {product.expiryDate && (
                                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${new Date(product.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))
                                                ? 'text-amber-500' : 'text-slate-400'
                                                }`}>
                                                <Calendar size={10} /> Exp: {new Date(product.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.15em] mb-1">Price</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{product.price}</p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm group-active:scale-90"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Premium Cart Sidebar */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[201] flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-600 p-2.5 rounded-xl text-white">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Health Cart</h2>
                                </div>
                                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                            <ShoppingCart size={32} className="text-emerald-200" />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item._id} className="flex items-center gap-5 group">
                                            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">{item.name}</h4>
                                                <p className="text-xs font-bold text-emerald-600">₹{item.price}</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                        <button
                                                            onClick={() => {
                                                                if (item.quantity > 1) {
                                                                    setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i));
                                                                } else {
                                                                    setCart(cart.filter(i => i._id !== item._id));
                                                                }
                                                            }}
                                                            className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-all"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-[10px] font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i))}
                                                            className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 shadow-sm transition-all"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setCart(cart.filter(i => i._id !== item._id))}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-slate-900 tracking-tight pt-3 border-t border-slate-200">
                                        <span>Total Amount</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                </div>
                                <button
                                    disabled={cart.length === 0}
                                    onClick={handleCheckout}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                                >
                                    <CreditCard size={18} /> Complete Order
                                </button>
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <ShieldCheck className="text-emerald-500" size={14} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Checkout Powered by Razorpay</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pharmacy;
