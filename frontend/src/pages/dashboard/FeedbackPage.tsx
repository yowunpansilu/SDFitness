import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { MessageSquare, Lightbulb, Bug, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface FeedbackLog {
    _id: string;
    category: string;
    message: string;
    status: string;
    adminNotes?: string;
    createdAt: string;
}

export function FeedbackPage() {
    const { token } = useAuthStore();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<FeedbackLog[]>([]);

    // Form fields
    const [category, setCategory] = useState<'bug' | 'feature_request' | 'general' | 'complaint'>('general');
    const [message, setMessage] = useState('');

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/feedback/my?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load feedback history:', error);
        }
    };

    useEffect(() => {
        if (token) fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            alert('Please provide a message before submitting.');
            return;
        }

        if (message.length < 10) {
            alert('Your message is too short. Please provide a bit more detail!');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/feedback`, {
                category,
                message
            });

            setMessage('');
            await fetchHistory();

            toast({
                title: 'Feedback Sent!',
                description: 'Thank you! Your feedback has been securely submitted.',
                variant: 'default'
            });
        } catch (error) {
            console.error('Failed to submit feedback', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'bug': return <Bug className="w-5 h-5 text-red-500" />;
            case 'feature_request': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
            case 'complaint': return <HelpCircle className="w-5 h-5 text-orange-500" />;
            default: return <MessageSquare className="w-5 h-5 text-primary-500" />;
        }
    };

    const getStatusPillColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary-500" />
                    Give us your feedback
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Whether you found a bug, have an amazing idea for a new feature, or simply want to tell us how we are doing—we are listening closely!
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">

                {/* Submission Form Component - Left Side */}
                <Card className="lg:col-span-5 border-border shadow-sm top-6 sticky">
                    <CardHeader>
                        <CardTitle>Submit Feedback</CardTitle>
                        <CardDescription>All tickets are reviewed by Gym Administrators directly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="w-full p-2.5 border rounded-md bg-transparent focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                    value={category}
                                    onChange={(e: any) => setCategory(e.target.value)}
                                >
                                    <option value="general">General Feedback</option>
                                    <option value="bug">Report a Bug / Issue</option>
                                    <option value="feature_request">Feature Request</option>
                                    <option value="complaint">Complaint</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium">Your Message</label>
                                    <span className={`text-xs ${message.length > 500 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {message.length} / 500
                                    </span>
                                </div>
                                <textarea
                                    className="w-full p-3 border rounded-md bg-transparent min-h-[150px] resize-y focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                    placeholder="Explain your thoughts in detail here..."
                                    required
                                    maxLength={500}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <Button type="submit" className="w-full mt-2 group" disabled={isSubmitting || message.length > 500}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Send to Developers'}
                                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Ticket History Listing Component - Right Side */}
                <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-headline font-bold text-xl flex items-center gap-2 mb-4">
                        Your Support Tickets
                    </h3>

                    {history.length === 0 ? (
                        <Card className="bg-muted/20 border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                                <p className="font-medium text-lg text-foreground/70">No feedback submitted yet!</p>
                                <p className="text-sm mt-1 max-w-sm">When you submit feedback, you can track whether Admins have reviewed or responded to it right here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {history.map((ticket) => (
                                <Card key={ticket._id} className="border-border shadow-sm transition-colors hover:border-primary-200 overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(ticket.category)}
                                                    <span className="font-semibold capitalize text-foreground/90">
                                                        {ticket.category.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize tracking-wide ${getStatusPillColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground/90 leading-relaxed mb-2 whitespace-pre-wrap">
                                                {ticket.message}
                                            </p>

                                            <div className="text-xs text-muted-foreground/50 font-medium">
                                                Submitted on {new Date(ticket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>

                                        {/* Admin Response Block */}
                                        {ticket.adminNotes && (
                                            <div className="bg-secondary/5 border-t border-border/50 p-4 pl-5 border-l-4 border-l-secondary">
                                                <div className="text-xs font-bold text-secondary-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <span>Admin Response</span>
                                                </div>
                                                <p className="text-sm text-foreground/90 italic">
                                                    {ticket.adminNotes}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
