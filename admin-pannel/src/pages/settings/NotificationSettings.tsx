import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Radio } from 'lucide-react';

export function NotificationSettings() {
    return (
        <div className="space-y-6">
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-yellow-400" />
                        <CardTitle className="text-white">Notification Settings</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Configure email, SMS, and push notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-dark-800 mb-4">
                            <Radio className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                        <p className="text-gray-400 max-w-md">
                            Notification configuration including SMTP, SMS gateway, and push notification settings will be available in Phase 2.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
