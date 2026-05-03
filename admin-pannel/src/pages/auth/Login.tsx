import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import { LogIn } from 'lucide-react';
import api from '@/lib/api/axios';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Admin Login Error:', err);
      alert(err.response?.data?.message || 'Connection to security server failed.');
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-navy-900 text-white mb-6 shadow-2xl shadow-navy-100 rotate-6 hover:rotate-0 transition-transform duration-500">
            <LogIn className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-navy-950 uppercase">
            SD <span className="text-indigo-600">Fitness</span>
          </h1>
          <p className="text-navy-400 font-bold uppercase text-xs tracking-[0.4em] mt-2">
            Admin Intelligence Suite
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-navy-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4 text-center border-b border-navy-50/50">
            <CardTitle className="text-2xl font-bold text-navy-950 uppercase tracking-tight">Access Gate</CardTitle>
            <CardDescription className="text-navy-400 font-bold text-[11px] uppercase tracking-widest mt-1">
              Authorize administrative session
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-navy-400 ml-1">
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
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-navy-400 ml-1">
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
                className="w-full h-12 bg-navy-950 hover:bg-navy-900 text-white font-bold uppercase text-xs tracking-wider shadow-xl shadow-navy-200 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
                    Registe Session
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-navy-300 font-bold text-xs uppercase tracking-widest">
          &copy; 2024 SD Fitness Global. Secured
        </p>
      </div>
    </div>
  );
}
