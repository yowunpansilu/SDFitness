import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CURRENCIES = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'AUD', label: 'AUD (A$)' },
];

const TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
];

interface BusinessHours {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

export function GeneralSettings() {
    const { toast } = useToast();

    const [gymInfo, setGymInfo] = useState({
        name: 'SD Fitness',
        email: 'contact@sdfitness.com',
        phone: '+1 (555) 123-4567',
        website: 'https://sdfitness.com',
        street: '123 Fitness Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        description: 'Premium fitness center with state-of-the-art equipment and professional trainers.',
    });

    const [businessHours, setBusinessHours] = useState<Record<string, BusinessHours>>({
        Monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        Tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        Wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        Thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        Friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        Saturday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        Sunday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    });

    const [localization, setLocalization] = useState({
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCopyHours = () => {
        const mondayHours = businessHours.Monday;
        const newHours = { ...businessHours };
        DAYS_OF_WEEK.forEach(day => {
            newHours[day] = { ...mondayHours };
        });
        setBusinessHours(newHours);
        toast({
            title: 'Hours Copied',
            description: 'Monday hours have been copied to all days',
        });
    };

    const handleSave = () => {
        // In a real app, this would save to backend
        toast({
            title: 'Settings Saved',
            description: 'Your gym settings have been updated successfully',
        });
    };

    return (
        <div className="space-y-6">
            {/* Gym Information */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Gym Information</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Update your gym's basic information and contact details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Gym Logo</Label>
                        <div className="flex items-center gap-4">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-lg bg-card border-2 border-dashed border-border flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <input
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                    className="bg-card border-border text-muted-foreground hover:bg-muted"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Logo
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gym-name" className="text-muted-foreground">Gym Name</Label>
                            <Input
                                id="gym-name"
                                value={gymInfo.name}
                                onChange={(e) => setGymInfo({ ...gymInfo, name: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={gymInfo.email}
                                onChange={(e) => setGymInfo({ ...gymInfo, email: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
                            <Input
                                id="phone"
                                value={gymInfo.phone}
                                onChange={(e) => setGymInfo({ ...gymInfo, phone: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-muted-foreground">Website</Label>
                            <Input
                                id="website"
                                value={gymInfo.website}
                                onChange={(e) => setGymInfo({ ...gymInfo, website: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="street" className="text-muted-foreground">Street Address</Label>
                        <Input
                            id="street"
                            value={gymInfo.street}
                            onChange={(e) => setGymInfo({ ...gymInfo, street: e.target.value })}
                            className="bg-card border-border text-foreground"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-muted-foreground">City</Label>
                            <Input
                                id="city"
                                value={gymInfo.city}
                                onChange={(e) => setGymInfo({ ...gymInfo, city: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-muted-foreground">State</Label>
                            <Input
                                id="state"
                                value={gymInfo.state}
                                onChange={(e) => setGymInfo({ ...gymInfo, state: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zip" className="text-muted-foreground">ZIP Code</Label>
                            <Input
                                id="zip"
                                value={gymInfo.zip}
                                onChange={(e) => setGymInfo({ ...gymInfo, zip: e.target.value })}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                        <Textarea
                            id="description"
                            value={gymInfo.description}
                            onChange={(e) => setGymInfo({ ...gymInfo, description: e.target.value })}
                            rows={3}
                            className="bg-card border-border text-foreground resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">Business Hours</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Set your operating hours for each day of the week
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyHours}
                            className="bg-card border-border text-muted-foreground hover:bg-muted"
                        >
                            Copy Monday to All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="flex items-center gap-4">
                            <div className="w-28 text-muted-foreground font-medium">{day}</div>
                            <Switch
                                checked={businessHours[day].isOpen}
                                onCheckedChange={(checked) =>
                                    setBusinessHours({
                                        ...businessHours,
                                        [day]: { ...businessHours[day], isOpen: checked },
                                    })
                                }
                            />
                            {businessHours[day].isOpen ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        type="time"
                                        value={businessHours[day].openTime}
                                        onChange={(e) =>
                                            setBusinessHours({
                                                ...businessHours,
                                                [day]: { ...businessHours[day], openTime: e.target.value },
                                            })
                                        }
                                        className="bg-card border-border text-foreground w-32"
                                    />
                                    <span className="text-muted-foreground">to</span>
                                    <Input
                                        type="time"
                                        value={businessHours[day].closeTime}
                                        onChange={(e) =>
                                            setBusinessHours({
                                                ...businessHours,
                                                [day]: { ...businessHours[day], closeTime: e.target.value },
                                            })
                                        }
                                        className="bg-card border-border text-foreground w-32"
                                    />
                                </div>
                            ) : (
                                <div className="text-muted-foreground flex-1">Closed</div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Localization */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Localization</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Configure currency, timezone, and date formats
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Currency</Label>
                            <Select
                                value={localization.currency}
                                onValueChange={(value) =>
                                    setLocalization({ ...localization, currency: value })
                                }
                            >
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem key={currency.value} value={currency.value} className="text-foreground">
                                            {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Timezone</Label>
                            <Select
                                value={localization.timezone}
                                onValueChange={(value) =>
                                    setLocalization({ ...localization, timezone: value })
                                }
                            >
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value} className="text-foreground">
                                            {tz.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Date Format</Label>
                            <Select
                                value={localization.dateFormat}
                                onValueChange={(value) =>
                                    setLocalization({ ...localization, dateFormat: value })
                                }
                            >
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="MM/DD/YYYY" className="text-foreground">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="DD/MM/YYYY" className="text-foreground">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="YYYY-MM-DD" className="text-foreground">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
