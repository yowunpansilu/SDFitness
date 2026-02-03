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
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">SD Fitness Admin</h1>
                    <p className="text-gray-400 mt-2">Sign in to access the admin panel</p>
                </div>

                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Login</CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter your credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@sdfitness.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-dark-800/50 border-dark-700 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-dark-800/50 border-dark-700 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20 transition-all duration-200"
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
