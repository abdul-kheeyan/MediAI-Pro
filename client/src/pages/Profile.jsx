import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplets, Calendar, Activity, Save, ArrowLeft, Loader2, Edit3, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        bloodGroup: '',
        address: '',
        gender: '',
        dateOfBirth: '',
        specialization: '',
        qualifications: '',
        shopName: '',
        profileImage: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            const profileDataWithImage = {
                ...res.data,
                dateOfBirth: res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split('T')[0] : '',
                specialization: res.data.specialization || '',
                qualifications: res.data.qualifications || '',
                shopName: res.data.shopName || ''
            };
            setProfileData(profileDataWithImage);

            // Sync with context
            const existingUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            const updatedUserInfo = { ...existingUserInfo, ...res.data };
            setUser(updatedUserInfo);
            sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', profileData);

            // In case user object from context doesn't have token, 
            // merge properly with existing data from sessionStorage to preserve token
            const existingUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            const updatedUserInfo = { ...existingUserInfo, ...res.data };

            setUser(updatedUserInfo);
            sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            setEditMode(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await api.post('/auth/profile/image', formData);

            const existingUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            const updatedUserInfo = { ...existingUserInfo, profileImage: res.data.profileImage };

            setUser(updatedUserInfo);
            sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            setProfileData(prev => ({ ...prev, profileImage: res.data.profileImage }));
            toast.success('Profile picture updated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-6 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-all border border-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medical Profile</h1>
                    </div>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="btn-primary py-2.5 px-6 text-xs"
                        >
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Panel: Profile View */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-1 space-y-6"
                    >
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 border-4 border-white shadow-xl overflow-hidden relative">
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                                            <Loader2 className="animate-spin text-indigo-600" size={24} />
                                        </div>
                                    )}
                                    {profileData.profileImage ? (
                                        <img src={getImageUrl(profileData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={60} />
                                    )}
                                </div>
                                {editMode && (
                                    <>
                                        <input
                                            type="file"
                                            id="profile-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all border-4 border-white cursor-pointer"
                                        >
                                            <Camera size={18} />
                                        </label>
                                    </>
                                )}
                            </div>
                            <h2 className="text-xl font-black text-slate-900">{profileData.name}</h2>
                            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-1">
                                {user?.role === 'doctor' ? `Doctor • ${profileData.specialization || 'General'}` :
                                    user?.role === 'pharmacy' ? `Pharmacy • ${profileData.shopName || 'Health Store'}` :
                                        'Patient Identity'}
                            </p>

                            <div className="mt-8 flex items-center justify-center gap-4">
                                <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                                    <p className="text-lg font-black text-indigo-600">{profileData.bloodGroup || '--'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-premium">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Identity Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={16} className="text-indigo-400" />
                                    <span className="text-sm font-bold">{profileData.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={16} className="text-indigo-400" />
                                    <span className="text-sm font-bold">{profileData.phone || 'Add Phone'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin size={16} className="text-indigo-400" />
                                    <span className="text-sm font-bold">{profileData.address || 'Add Address'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel: Form/Bio */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-2"
                    >
                        {editMode ? (
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
                                <form onSubmit={handleSave} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                            <select
                                                value={profileData.gender}
                                                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                                className="input-field appearance-none"
                                            >
                                                <option value="">Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                            <input
                                                type="text"
                                                value={profileData.bloodGroup}
                                                onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                                                className="input-field"
                                                placeholder="e.g. O+"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={profileData.dateOfBirth}
                                                onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Medical Bio/History</label>
                                        <textarea
                                            rows="4"
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            className="input-field resize-none py-4"
                                            placeholder="Mention any allergies, chronic conditions, or general health notes..."
                                        ></textarea>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Home Address</label>
                                        <input
                                            type="text"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>

                                    {user?.role === 'doctor' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                            <div className="space-y-3">
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Specialization</label>
                                                <select
                                                    value={profileData.specialization}
                                                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                                    className="input-field appearance-none"
                                                >
                                                    <option value="">Select Specialization...</option>
                                                    <option value="Cardiology">Cardiology</option>
                                                    <option value="Dermatology">Dermatology</option>
                                                    <option value="Neurology">Neurology</option>
                                                    <option value="Pediatrics">Pediatrics</option>
                                                    <option value="General Medicine">General Medicine</option>
                                                    <option value="Orthopedics">Orthopedics</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Qualifications</label>
                                                <input
                                                    type="text"
                                                    value={profileData.qualifications}
                                                    onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
                                                    className="input-field"
                                                    placeholder="e.g. MBBS, MD, DO"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {user?.role === 'pharmacy' && (
                                        <div className="space-y-6 pt-6 border-t border-slate-100">
                                            <div className="space-y-3">
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Pharmacy/Shop Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.shopName}
                                                    onChange={(e) => setProfileData({ ...profileData, shopName: e.target.value })}
                                                    className="input-field"
                                                    placeholder="e.g. City Medicals"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setEditMode(false)}
                                            className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-primary flex-[2]"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                        <Activity className="text-indigo-600" /> Medical Background
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">
                                        {profileData.bio || "No medical background description provided. Add your health notes to help doctors understand your history better."}
                                    </p>
                                </div>

                                {user?.role === 'doctor' && (
                                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                            <Activity className="text-indigo-600" /> Professional Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Specialization</p>
                                                <p className="text-lg font-bold text-slate-900">{profileData.specialization || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Qualifications</p>
                                                <p className="text-lg font-bold text-slate-900">{profileData.qualifications || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-10">
                                        <Droplets size={120} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 relative z-10">Health Insights</h3>
                                    <p className="text-indigo-100 font-medium mb-8 relative z-10 opacity-80">
                                        Your medical profile is used to provide personalized recommendations and faster check-ins during consultations.
                                    </p>
                                    <div className="flex items-center gap-10 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Status</p>
                                            <p className="text-lg font-black">Active</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Vault</p>
                                            <p className="text-lg font-black">Secured</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
