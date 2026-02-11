import React, { useState } from 'react';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Primitives';

export const AuthScreen = ({ supabase }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });
                if (error) throw error;
            }
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6 no-print">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/50 animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-6">
                        <Wallet className="text-white" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orange Finance</h1>
                    <p className="text-gray-500 text-sm">by Swinfosystems</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 transition-all">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                            <input
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full bg-transparent outline-none font-semibold text-gray-800"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 transition-all">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-transparent outline-none font-semibold text-gray-800"
                            placeholder="name@mail.com"
                            required
                        />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 transition-all">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-transparent outline-none font-semibold text-gray-800"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <Button disabled={loading} className="w-full py-4 shadow-xl flex justify-center">
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-500">
                    {isLogin ? "New here? " : "Have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-orange-600 font-bold hover:underline">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};
