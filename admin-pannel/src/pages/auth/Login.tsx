import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import { LogIn } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuthStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login for demo
        const mockUser = {
            id: '1',
            email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            profilePhoto: undefined,
        };
        login(mockUser, 'mock-token');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white mb-6 shadow-2xl shadow-indigo-200 rotate-6 hover:rotate-0 transition-transform duration-500">
                        <LogIn className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        SD <span className="text-indigo-600">Fitness</span>
                    </h1>
                    <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.3em] mt-2">
                        Admin Intelligence Suite
                    </p>
                </div>

                <Card className="bg-white/80 backdrop-blur-xl border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4 text-center">
                        <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Gate</CardTitle>
                        <CardDescription className="text-slate-500 font-medium italic">
                            Authorize your administrative session
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                    Identity Handle
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@sdfitness.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                    Cipher Key
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Initialize Session
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-slate-400 font-medium text-[11px] uppercase tracking-widest">
                    &copy; 2024 SD Fitness Global. All rights reserved.
                </p>
            </div>
        </div>
    );
}
