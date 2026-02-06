import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mail, Smartphone, Bell as BellIcon, Send, Save } from 'lucide-react';

interface NotificationPreferences {
    email: {
        newMemberRegistration: boolean;
        paymentReceived: boolean;
        classBooking: boolean;
        membershipExpiry7Days: boolean;
        membershipExpiry3Days: boolean;
        membershipExpiry1Day: boolean;
        equipmentMaintenance: boolean;
    };
    sms: {
        enabled: boolean;
        classReminders: boolean;
        paymentConfirmations: boolean;
        membershipExpiry: boolean;
    };
    push: {
        enabled: boolean;
        newBookings: boolean;
        payments: boolean;
        announcements: boolean;
    };
}

export function NotificationSettings() {
    const { toast } = useToast();

    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email: {
            newMemberRegistration: true,
            paymentReceived: true,
            classBooking: true,
            membershipExpiry7Days: true,
            membershipExpiry3Days: true,
            membershipExpiry1Day: true,
            equipmentMaintenance: true,
        },
        sms: {
            enabled: false,
            classReminders: false,
            paymentConfirmations: false,
            membershipExpiry: false,
        },
        push: {
            enabled: false,
            newBookings: false,
            payments: false,
            announcements: false,
        },
    });

    const [smsConfig, setSmsConfig] = useState({
        provider: 'twilio',
        accountSid: '',
        authToken: '',
        phoneNumber: '',
    });

    const [pushConfig, setPushConfig] = useState({
        provider: 'firebase',
        serverKey: '',
        senderId: '',
    });

    const handleEmailToggle = (key: keyof typeof preferences.email) => {
        setPreferences({
            ...preferences,
            email: { ...preferences.email, [key]: !preferences.email[key] },
        });
    };

    const handleSmsToggle = (key: keyof typeof preferences.sms) => {
        setPreferences({
            ...preferences,
            sms: { ...preferences.sms, [key]: !preferences.sms[key] },
        });
    };

    const handlePushToggle = (key: keyof typeof preferences.push) => {
        setPreferences({
            ...preferences,
            push: { ...preferences.push, [key]: !preferences.push[key] },
        });
    };

    const handleSave = () => {
        toast({
            title: 'Settings Saved',
            description: 'Notification preferences have been updated successfully',
        });
    };

    const handleTestSMS = () => {
        toast({
            title: 'Test SMS Sent',
            description: 'A test SMS has been sent to your configured number',
        });
    };

    const handleTestPush = () => {
        toast({
            title: 'Test Notification Sent',
            description: 'A test push notification has been sent',
        });
    };

    return (
        <div className="space-y-6">
            {/* Email Notifications */}
            <Card className="bg-dark-900/50 border-dark-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">Email Notifications</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Configure which events trigger email notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-new-member" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">New Member Registration</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Notify admins when a new member signs up
                                </span>
                            </Label>
                            <Switch
                                id="email-new-member"
                                checked={preferences.email.newMemberRegistration}
                                onCheckedChange={() => handleEmailToggle('newMemberRegistration')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-payment" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">Payment Received</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Notify when a payment is successfully processed
                                </span>
                            </Label>
                            <Switch
                                id="email-payment"
                                checked={preferences.email.paymentReceived}
                                onCheckedChange={() => handleEmailToggle('paymentReceived')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-booking" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">Class Booking</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Notify when a member books a class
                                </span>
                            </Label>
                            <Switch
                                id="email-booking"
                                checked={preferences.email.classBooking}
                                onCheckedChange={() => handleEmailToggle('classBooking')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-expiry-7" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">Membership Expiry (7 Days)</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Send reminder 7 days before expiry
                                </span>
                            </Label>
                            <Switch
                                id="email-expiry-7"
                                checked={preferences.email.membershipExpiry7Days}
                                onCheckedChange={() => handleEmailToggle('membershipExpiry7Days')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-expiry-3" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">Membership Expiry (3 Days)</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Send reminder 3 days before expiry
                                </span>
                            </Label>
                            <Switch
                                id="email-expiry-3"
                                checked={preferences.email.membershipExpiry3Days}
                                onCheckedChange={() => handleEmailToggle('membershipExpiry3Days')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-expiry-1" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">Membership Expiry (1 Day)</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Send final reminder 1 day before expiry
                                </span>
                            </Label>
                            <Switch
                                id="email-expiry-1"
                                checked={preferences.email.membershipExpiry1Day}
                                onCheckedChange={() => handleEmailToggle('membershipExpiry1Day')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-equipment" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-gray-300">Equipment Maintenance Due</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Alert when equipment needs maintenance
                                </span>
                            </Label>
                            <Switch
                                id="email-equipment"
                                checked={preferences.email.equipmentMaintenance}
                                onCheckedChange={() => handleEmailToggle('equipmentMaintenance')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card className="bg-dark-900/50 border-dark-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">SMS Notifications</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Configure SMS gateway and notification preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                        <div>
                            <div className="font-medium text-white">Enable SMS Notifications</div>
                            <div className="text-sm text-gray-400">Turn on SMS messaging for members</div>
                        </div>
                        <Switch
                            checked={preferences.sms.enabled}
                            onCheckedChange={() => handleSmsToggle('enabled')}
                        />
                    </div>

                    {preferences.sms.enabled && (
                        <>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Provider</Label>
                                        <Input
                                            value={smsConfig.provider}
                                            onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                                            className="bg-dark-800 border-dark-700 text-white"
                                            placeholder="Twilio, Nexmo, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Phone Number</Label>
                                        <Input
                                            value={smsConfig.phoneNumber}
                                            onChange={(e) => setSmsConfig({ ...smsConfig, phoneNumber: e.target.value })}
                                            className="bg-dark-800 border-dark-700 text-white"
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Account SID</Label>
                                        <Input
                                            value={smsConfig.accountSid}
                                            onChange={(e) => setSmsConfig({ ...smsConfig, accountSid: e.target.value })}
                                            className="bg-dark-800 border-dark-700 text-white"
                                            placeholder="Enter account SID"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Auth Token</Label>
                                        <Input
                                            type="password"
                                            value={smsConfig.authToken}
                                            onChange={(e) => setSmsConfig({ ...smsConfig, authToken: e.target.value })}
                                            className="bg-dark-800 border-dark-700 text-white"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTestSMS}
                                        className="bg-dark-800 border-dark-700 text-gray-300 hover:bg-dark-700"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Test SMS
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-dark-700">
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">Class Reminders</Label>
                                    <Switch
                                        checked={preferences.sms.classReminders}
                                        onCheckedChange={() => handleSmsToggle('classReminders')}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">Payment Confirmations</Label>
                                    <Switch
                                        checked={preferences.sms.paymentConfirmations}
                                        onCheckedChange={() => handleSmsToggle('paymentConfirmations')}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">Membership Expiry</Label>
                                    <Switch
                                        checked={preferences.sms.membershipExpiry}
                                        onCheckedChange={() => handleSmsToggle('membershipExpiry')}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card className="bg-dark-900/50 border-dark-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BellIcon className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">Push Notifications</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Configure push notification service
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                        <div>
                            <div className="font-medium text-white">Enable Push Notifications</div>
                            <div className="text-sm text-gray-400">Send push notifications to mobile app users</div>
                        </div>
                        <Switch
                            checked={preferences.push.enabled}
                            onCheckedChange={() => handlePushToggle('enabled')}
                        />
                    </div>

                    {preferences.push.enabled && (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Provider</Label>
                                    <Input
                                        value={pushConfig.provider}
                                        onChange={(e) => setPushConfig({ ...pushConfig, provider: e.target.value })}
                                        className="bg-dark-800 border-dark-700 text-white"
                                        placeholder="Firebase, OneSignal, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Server Key</Label>
                                    <Input
                                        type="password"
                                        value={pushConfig.serverKey}
                                        onChange={(e) => setPushConfig({ ...pushConfig, serverKey: e.target.value })}
                                        className="bg-dark-800 border-dark-700 text-white"
                                        placeholder="Enter server key"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Sender ID</Label>
                                    <Input
                                        value={pushConfig.senderId}
                                        onChange={(e) => setPushConfig({ ...pushConfig, senderId: e.target.value })}
                                        className="bg-dark-800 border-dark-700 text-white"
                                        placeholder="Enter sender ID"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTestPush}
                                        className="bg-dark-800 border-dark-700 text-gray-300 hover:bg-dark-700"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Test Push
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-dark-700">
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">New Bookings</Label>
                                    <Switch
                                        checked={preferences.push.newBookings}
                                        onCheckedChange={() => handlePushToggle('newBookings')}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">Payments</Label>
                                    <Switch
                                        checked={preferences.push.payments}
                                        onCheckedChange={() => handlePushToggle('payments')}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">Announcements</Label>
                                    <Switch
                                        checked={preferences.push.announcements}
                                        onCheckedChange={() => handlePushToggle('announcements')}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
