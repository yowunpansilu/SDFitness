import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, FileText } from 'lucide-react';

export function EmailTemplates() {
    return (
        <div className="space-y-6">
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white">Email Templates</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Customize email templates sent to members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-dark-800 mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                        <p className="text-gray-400 max-w-md">
                            Email template editor with rich text formatting and variable insertion will be available in Phase 2.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
