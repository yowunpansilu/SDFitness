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

  const [isLoading, setIsLoading] = useState(false);
  const API_URL = 'http://localhost:5000'; // Standard backend port

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        if (data.user.role !== 'admin') {
          alert('Access Denied: Administrative privileges required.');
          setIsLoading(false);
          return;
        }
        login(data.user, data.token);
      } else {
        alert(data.message || 'Login failed!');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Admin Login Error:', error);
      alert('Connection to security server failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-navy-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-white text-slate-900 mb-6 shadow-2xl shadow-navy-100 rotate-6 hover:rotate-0 transition-transform duration-500">
            <LogIn className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-navy-950 uppercase italic">
            SD <span className="text-indigo-600">Fitness</span>
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">
            Admin Intelligence Suite
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-navy-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4 text-center border-b border-navy-50/50">
            <CardTitle className="text-2xl font-black text-navy-950 uppercase tracking-tight">Access Gate</CardTitle>
            <CardDescription className="text-slate-600 font-bold text-[11px] uppercase tracking-widest mt-1">
              Authorize administrative session
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
                  Identity Handle
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sdfitness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-navy-50/50 border-none focus:ring-4 focus:ring-navy-500/10 rounded-2xl font-bold text-navy-900 placeholder:text-navy-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">
                  Cipher Key
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-navy-50/50 border-none focus:ring-4 focus:ring-navy-500/10 rounded-2xl font-bold text-navy-900 placeholder:text-navy-200"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-slate-50 hover:bg-white text-slate-900 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-navy-200 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authorizing...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Initialize Session
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em]">
          &copy; 2024 SD Fitness Global. Secured
        </p>
      </div>
    </div>
  );
}
