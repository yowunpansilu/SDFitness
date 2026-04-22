import { useState } from 'react';
import { MessageSquare, Bug, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback } from '@/lib/api/feedbackService';

export function FeedbackModal() {
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<any>('bug');
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!message) return;

        setSubmitting(true);
        try {
            await submitFeedback({ message, category });
            toast({
                title: "Feedback Received",
                description: "Thank you for your feedback! We will review it shortly.",
            });
            setMessage('');
            setOpen(false);
        } catch (err: any) {
            toast({
                title: "Submission Failed",
                description: err.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full border-primary-200 hover:bg-primary-50">
                    <MessageSquare className="w-4 h-4" />
                    Give Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Bug className="w-6 h-6 text-primary-500" />
                        Help us improve
                    </DialogTitle>
                    <DialogDescription>
                        Found a bug or have a suggestion? Let us know below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="suggestion">Suggestion</SelectItem>
                                <SelectItem value="complaint">Complaint</SelectItem>
                                <SelectItem value="feature_request">Feature Request</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your Message</label>
                        <Textarea
                            placeholder="Please describe the issue or your suggestion in detail..."
                            className="min-h-[150px] bg-background/50"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !message}
                        className="gap-2 shadow-lg shadow-primary-500/20"
                    >
                        {submitting ? 'Sending...' : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
