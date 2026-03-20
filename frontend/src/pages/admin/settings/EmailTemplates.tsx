import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Eye, Save, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EMAIL_TEMPLATES = [
    { id: 'welcome', name: 'Welcome Email', description: 'Sent when a new member joins' },
    { id: 'payment', name: 'Payment Confirmation', description: 'Sent after successful payment' },
    { id: 'class_reminder', name: 'Class Reminder', description: 'Sent before booked classes' },
    { id: 'membership_expiry', name: 'Membership Expiry', description: 'Sent before membership expires' },
];

const VARIABLES = [
    { key: '{{memberName}}', description: 'Member\'s full name' },
    { key: '{{firstName}}', description: 'Member\'s first name' },
    { key: '{{email}}', description: 'Member\'s email' },
    { key: '{{amount}}', description: 'Payment amount' },
    { key: '{{className}}', description: 'Class name' },
    { key: '{{classTime}}', description: 'Class time' },
    { key: '{{trainerName}}', description: 'Trainer name' },
    { key: '{{expiryDate}}', description: 'Membership expiry date' },
    { key: '{{gymName}}', description: 'Gym name' },
];

const DEFAULT_TEMPLATES = {
    welcome: {
        subject: 'Welcome to {{gymName}}!',
        body: `Hi {{firstName}},\n\nWelcome to {{gymName}}! We're thrilled to have you join our fitness community.\n\nYour membership is now active, and you can start booking classes, tracking workouts, and achieving your fitness goals.\n\nIf you have any questions, feel free to reach out to us.\n\nBest regards,\nThe {{gymName}} Team`,
    },
    payment: {
        subject: 'Payment Confirmation - {{gymName}}',
        body: `Hi {{firstName}},\n\nThank you for your payment of {{amount}}.\n\nThis email confirms that we have received your payment successfully. You can view your payment history in your member dashboard.\n\nThank you for being a valued member!\n\nBest regards,\nThe {{gymName}} Team`,
    },
    class_reminder: {
        subject: 'Class Reminder: {{className}}',
        body: `Hi {{firstName}},\n\nThis is a reminder that you have a class booked:\n\nClass: {{className}}\nTime: {{classTime}}\nTrainer: {{trainerName}}\n\nWe look forward to seeing you!\n\nBest regards,\nThe {{gymName}} Team`,
    },
    membership_expiry: {
        subject: 'Your Membership is Expiring Soon',
        body: `Hi {{firstName}},\n\nYour membership at {{gymName}} will expire on {{expiryDate}}.\n\nTo continue enjoying our facilities and classes, please renew your membership before it expires.\n\nRenew now to avoid any interruption to your fitness journey!\n\nBest regards,\nThe {{gymName}} Team`,
    },
};

export function EmailTemplates() {
    const { toast } = useToast();
    const [selectedTemplate, setSelectedTemplate] = useState('welcome');
    const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
    const [showPreview, setShowPreview] = useState(false);

    const [smtpConfig, setSmtpConfig] = useState({
        host: 'smtp.gmail.com',
        port: '587',
        username: 'gym@example.com',
        password: '',
        fromName: 'SD Fitness',
        fromEmail: 'noreply@sdfitness.com',
    });

    const currentTemplate = templates[selectedTemplate as keyof typeof templates];

    const handleSubjectChange = (value: string) => {
        setTemplates({
            ...templates,
            [selectedTemplate]: { ...currentTemplate, subject: value },
        });
    };

    const handleBodyChange = (value: string) => {
        setTemplates({
            ...templates,
            [selectedTemplate]: { ...currentTemplate, body: value },
        });
    };

    const insertVariable = (variable: string) => {
        const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = currentTemplate.body;
            const newText = text.substring(0, start) + variable + text.substring(end);
            handleBodyChange(newText);

            // Restore cursor position
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + variable.length;
                textarea.focus();
            }, 0);
        }
    };

    const handleSave = () => {
        toast({
            title: 'Templates Saved',
            description: 'Email templates have been updated successfully',
        });
    };

    const handleTestEmail = () => {
        toast({
            title: 'Test Email Sent',
            description: 'A test email has been sent to your email address',
        });
    };

    const renderPreview = () => {
        const sampleData: Record<string, string> = {
            '{{memberName}}': 'John Doe',
            '{{firstName}}': 'John',
            '{{email}}': 'john.doe@example.com',
            '{{amount}}': '$99.99',
            '{{className}}': 'HIIT Training',
            '{{classTime}}': '6:00 PM',
            '{{trainerName}}': 'Mike Ross',
            '{{expiryDate}}': 'March 15, 2026',
            '{{gymName}}': 'SD Fitness',
        };

        let previewSubject = currentTemplate.subject;
        let previewBody = currentTemplate.body;

        Object.entries(sampleData).forEach(([key, value]) => {
            previewSubject = previewSubject.replaceAll(key, value);
            previewBody = previewBody.replaceAll(key, value);
        });

        return { subject: previewSubject, body: previewBody };
    };

    const preview = renderPreview();

    return (
        <div className="space-y-6">
            {/* Template Editor */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Email Template Editor</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Customize email templates sent to your members
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Template Selector */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Select Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger className="bg-card border-border text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {EMAIL_TEMPLATES.map((template) => (
                                    <SelectItem key={template.id} value={template.id} className="text-foreground">
                                        <div>
                                            <div className="font-medium">{template.name}</div>
                                            <div className="text-xs text-muted-foreground">{template.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-2">
                        <Label htmlFor="email-subject" className="text-muted-foreground">Subject Line</Label>
                        <Input
                            id="email-subject"
                            value={currentTemplate.subject}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            className="bg-card border-border text-foreground"
                            placeholder="Enter email subject"
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-body" className="text-muted-foreground">Email Body</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-purple-400 hover:text-purple-300 hover:bg-card"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </Button>
                        </div>
                        {!showPreview ? (
                            <Textarea
                                id="email-body"
                                value={currentTemplate.body}
                                onChange={(e) => handleBodyChange(e.target.value)}
                                rows={12}
                                className="bg-card border-border text-foreground resize-none font-mono text-sm"
                                placeholder="Enter email content"
                            />
                        ) : (
                            <div className="bg-white p-6 rounded-lg border border-border min-h-[300px]">
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <div className="text-sm text-gray-600 mb-1">Subject:</div>
                                    <div className="font-semibold text-gray-900">{preview.subject}</div>
                                </div>
                                <div className="whitespace-pre-wrap text-gray-900">{preview.body}</div>
                            </div>
                        )}
                    </div>

                    {/* Variable Helper */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Available Variables
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {VARIABLES.map((variable) => (
                                <Badge
                                    key={variable.key}
                                    variant="outline"
                                    className="cursor-pointer bg-card border-border text-purple-400 hover:bg-muted transition-colors"
                                    onClick={() => insertVariable(variable.key)}
                                    title={variable.description}
                                >
                                    {variable.key}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Click on a variable to insert it at cursor position</p>
                    </div>
                </CardContent>
            </Card>

            {/* SMTP Configuration */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-foreground">SMTP Configuration</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">
                        Configure your email server settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="smtp-host" className="text-muted-foreground">SMTP Host</Label>
                            <Input
                                id="smtp-host"
                                value={smtpConfig.host}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                className="bg-card border-border text-foreground"
                                placeholder="smtp.gmail.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp-port" className="text-muted-foreground">Port</Label>
                            <Input
                                id="smtp-port"
                                value={smtpConfig.port}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                                className="bg-card border-border text-foreground"
                                placeholder="587"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="smtp-username" className="text-muted-foreground">Username</Label>
                            <Input
                                id="smtp-username"
                                value={smtpConfig.username}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                                className="bg-card border-border text-foreground"
                                placeholder="your-email@gmail.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp-password" className="text-muted-foreground">Password</Label>
                            <Input
                                id="smtp-password"
                                type="password"
                                value={smtpConfig.password}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                                className="bg-card border-border text-foreground"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from-name" className="text-muted-foreground">From Name</Label>
                            <Input
                                id="from-name"
                                value={smtpConfig.fromName}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                                className="bg-card border-border text-foreground"
                                placeholder="SD Fitness"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from-email" className="text-muted-foreground">From Email</Label>
                            <Input
                                id="from-email"
                                type="email"
                                value={smtpConfig.fromEmail}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                                className="bg-card border-border text-foreground"
                                placeholder="noreply@sdfitness.com"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={handleTestEmail}
                            className="bg-card border-border text-muted-foreground hover:bg-muted"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Send Test Email
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-foreground"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Templates
                </Button>
            </div>
        </div>
    );
}
