import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        sessionStorage.setItem('userInfo', JSON.stringify(data));
    };

    const register = async (name, email, password, role, shopName, specialization) => {
        const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
            role,
            shopName: role === 'pharmacy' ? shopName : undefined,
            specialization: role === 'doctor' ? specialization : undefined
        });
        setUser(data);
        sessionStorage.setItem('userInfo', JSON.stringify(data));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
