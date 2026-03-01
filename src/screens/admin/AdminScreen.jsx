import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

export const AdminScreen = () => {
    const [session, setSession] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
                verifyAdmin(session.user.id);
            } else {
                setLoading(false);
            }
        };

        checkAdminSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (s) {
                setSession(s);
                verifyAdmin(s.user.id);
            } else {
                setSession(null);
                setIsAdmin(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const verifyAdmin = async (userId) => {
        setLoading(true);
        // We use our secure RPC function to check if they are in the admins table
        const { data, error } = await supabase.rpc('is_admin');

        if (data === true) {
            setIsAdmin(true);
        } else {
            console.warn('User is not an admin', error);
            setIsAdmin(false);
            // Sign out the non-admin user trying to access admin panel
            await supabase.auth.signOut();
            alert('Access Denied. You are not registered as an Admin.');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                    <Loader2 className="animate-spin text-white" size={30} />
                </div>
            </div>
        );
    }

    if (!session || !isAdmin) {
        return <AdminLogin onLoginSuccess={(s) => { setSession(s); verifyAdmin(s.user.id); }} />;
    }

    return <AdminDashboard session={session} onLogout={() => supabase.auth.signOut()} />;
};
