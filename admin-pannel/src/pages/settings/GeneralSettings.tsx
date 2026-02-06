import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Switch } from '@/components/ui/switch';
import { Building2, Mail, Phone, Globe, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'INR', label: 'INR - Indian Rupee' },
];

const TIMEZONES = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export function GeneralSettings() {
    const { generalSettings, updateGeneralSettings } = useSettingsStore();

    const handleChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updateGeneralSettings({
                [parent]: {
                    ...(generalSettings as any)[parent],
                    [child]: value,
                },
            });
        } else {
            updateGeneralSettings({ [field]: value });
        }
    };

    const handleBusinessHoursChange = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: any) => {
        updateGeneralSettings({
            businessHours: {
                ...generalSettings.businessHours,
                [day]: {
                    ...generalSettings.businessHours[day],
                    [field]: value,
                },
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Gym Information */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">Gym Information</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Basic information about your gym
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Gym Name */}
                        <div className="space-y-2">
                            <Label htmlFor="gymName" className="text-gray-300">Gym Name</Label>
                            <Input
                                id="gymName"
                                value={generalSettings.gymName}
                                onChange={(e) => handleChange('gymName', e.target.value)}
                                className="bg-dark-800/50 border-dark-700 text-white"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-gray-300">Website</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="website"
                                    value={generalSettings.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    className="pl-10 bg-dark-800/50 border-dark-700 text-white"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Gym Logo</Label>
                        <ImageUpload
                            value={generalSettings.logoUrl}
                            onChange={(value) => handleChange('logoUrl', value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white">Contact Information</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        How members can reach you
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={generalSettings.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="pl-10 bg-dark-800/50 border-dark-700 text-white"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    value={generalSettings.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="pl-10 bg-dark-800/50 border-dark-700 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <Label className="text-gray-300">Physical Address</Label>
                        <div className="space-y-4">
                            <Input
                                placeholder="Street Address"
                                value={generalSettings.address.street}
                                onChange={(e) => handleChange('address.street', e.target.value)}
                                className="bg-dark-800/50 border-dark-700 text-white"
                            />
                            <div className="grid gap-4 md:grid-cols-3">
                                <Input
                                    placeholder="City"
                                    value={generalSettings.address.city}
                                    onChange={(e) => handleChange('address.city', e.target.value)}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                <Input
                                    placeholder="State"
                                    value={generalSettings.address.state}
                                    onChange={(e) => handleChange('address.state', e.target.value)}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                <Input
                                    placeholder="Zip Code"
                                    value={generalSettings.address.zipCode}
                                    onChange={(e) => handleChange('address.zipCode', e.target.value)}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <Label className="text-gray-300">Social Media Links</Label>
                        <div className="space-y-3">
                            <Input
                                placeholder="Facebook URL"
                                value={generalSettings.socialMedia.facebook}
                                onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                                className="bg-dark-800/50 border-dark-700 text-white"
                            />
                            <Input
                                placeholder="Instagram URL"
                                value={generalSettings.socialMedia.instagram}
                                onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                                className="bg-dark-800/50 border-dark-700 text-white"
                            />
                            <Input
                                placeholder="Twitter URL"
                                value={generalSettings.socialMedia.twitter}
                                onChange={(e) => handleChange('socialMedia.twitter', e.target.value)}
                                className="bg-dark-800/50 border-dark-700 text-white"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-400" />
                        <CardTitle className="text-white">Business Hours</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Set your operating hours for each day
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {DAYS_OF_WEEK.map(({ key, label }) => {
                            const hours = generalSettings.businessHours[key];
                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-all',
                                        hours.isOpen
                                            ? 'bg-dark-800/30 border-dark-700'
                                            : 'bg-dark-900/30 border-dark-800 opacity-60'
                                    )}
                                >
                                    <div className="flex items-center gap-3 sm:w-48">
                                        <Switch
                                            checked={hours.isOpen}
                                            onCheckedChange={(checked) =>
                                                handleBusinessHoursChange(key, 'isOpen', checked)
                                            }
                                        />
                                        <Label className="text-white font-medium">{label}</Label>
                                    </div>

                                    {hours.isOpen ? (
                                        <div className="flex items-center gap-3 flex-1">
                                            <Input
                                                type="time"
                                                value={hours.openTime}
                                                onChange={(e) =>
                                                    handleBusinessHoursChange(key, 'openTime', e.target.value)
                                                }
                                                className="bg-dark-800/50 border-dark-700 text-white"
                                            />
                                            <span className="text-gray-400">to</span>
                                            <Input
                                                type="time"
                                                value={hours.closeTime}
                                                onChange={(e) =>
                                                    handleBusinessHoursChange(key, 'closeTime', e.target.value)
                                                }
                                                className="bg-dark-800/50 border-dark-700 text-white"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 text-gray-500 italic">Closed</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Localization */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Localization</CardTitle>
                    <CardDescription className="text-gray-400">
                        Currency and timezone settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Currency */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Currency</Label>
                            <Select
                                value={generalSettings.currency}
                                onValueChange={(value) => handleChange('currency', value)}
                            >
                                <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-900 border-dark-700">
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem key={currency.value} value={currency.value}>
                                            {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Timezone</Label>
                            <Select
                                value={generalSettings.timezone}
                                onValueChange={(value) => handleChange('timezone', value)}
                            >
                                <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-900 border-dark-700">
                                    {TIMEZONES.map((timezone) => (
                                        <SelectItem key={timezone.value} value={timezone.value}>
                                            {timezone.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
