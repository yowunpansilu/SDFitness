import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
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
  { value: 'Asia/Colombo', label: 'Sri Lanka (IST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export function GeneralSettings() {
  const { generalSettings, updateGeneralSettings } = useSettingsStore();

  const handleChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updateGeneralSettings({
        [parent]: {
          ...(generalSettings as unknown as Record<string, Record<string, unknown>>)[parent],
          [child]: value,
        },
      });
    } else {
      updateGeneralSettings({ [field]: value });
    }
  };

  const handleBusinessHoursChange = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: unknown) => {
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
    <div className="space-y-8 pb-10 text-slate-900 dark:text-white transition-colors">
      {/* Gym Information */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Gym Information</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-0.5 transition-colors">Basic details and branding</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gym Name */}
            <div className="space-y-2">
              <Label htmlFor="gymName" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Gym Name</Label>
              <Input
                id="gymName"
                value={generalSettings.gymName}
                onChange={(e) => handleChange('gymName', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-navy-600 transition-colors" />
                <Input
                  id="website"
                  value={generalSettings.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="h-11 pl-10 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Logo</Label>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950 border-2 border-dashed border-slate-200 dark:border-navy-800 hover:border-indigo-500/30 transition-all">
              <ImageUpload
                value={generalSettings.logoUrl}
                onChange={(value) => handleChange('logoUrl', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Contact Information</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-0.5 transition-colors">Email, phone and address</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-navy-600 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="h-11 pl-10 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-navy-600 transition-colors" />
                <Input
                  id="phone"
                  value={generalSettings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="h-11 pl-10 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Physical Address</Label>
            <div className="grid gap-4">
              <Input
                placeholder="Street Address"
                value={generalSettings.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
              />
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="City"
                  value={generalSettings.address.city}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
                />
                <Input
                  placeholder="State"
                  value={generalSettings.address.state}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
                />
                <Input
                  placeholder="Zip Code"
                  value={generalSettings.address.zipCode}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Social Media</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Facebook URL"
                value={generalSettings.socialMedia.facebook}
                onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
              />
              <Input
                placeholder="Instagram URL"
                value={generalSettings.socialMedia.instagram}
                onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
              />
              <Input
                placeholder="Twitter URL"
                value={generalSettings.socialMedia.twitter}
                onChange={(e) => handleChange('socialMedia.twitter', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Business Hours</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-0.5 transition-colors">Facility availability schedule</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="grid gap-4">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const hours = (generalSettings.businessHours as Record<string, { isOpen: boolean; openTime: string; closeTime: string }>)[key];
              return (
                <div
                  key={key}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[1.5rem] border transition-all duration-300',
                    hours.isOpen
                      ? 'bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <Switch
                      checked={hours.isOpen}
                      onCheckedChange={(checked) =>
                        handleBusinessHoursChange(key, 'isOpen', checked)
                      }
                      className="data-[state=checked]:bg-indigo-600"
                    />
                    <Label className={cn(
                      "font-bold uppercase text-[11px] tracking-widest transition-colors",
                      hours.isOpen ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-navy-600"
                    )}>{label}</Label>
                  </div>

                  {hours.isOpen ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 transition-colors">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-navy-600 uppercase">From</span>
                        <input
                          type="time"
                          value={hours.openTime}
                          onChange={(e) =>
                            handleBusinessHoursChange(key, 'openTime', e.target.value)
                          }
                          className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white focus:ring-0 w-20 transition-colors"
                        />
                      </div>
                      <div className="h-px w-3 bg-slate-200 dark:bg-navy-800" />
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 transition-colors">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-navy-600 uppercase">To</span>
                        <input
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) =>
                            handleBusinessHoursChange(key, 'closeTime', e.target.value)
                          }
                          className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white focus:ring-0 w-20 transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 dark:bg-navy-950 text-slate-400 dark:text-navy-600 border-none font-bold text-xs uppercase py-1 px-4 transition-colors">Offline</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Localization</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-0.5 transition-colors">Currency and timezone settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Currency</Label>
              <Select
                value={generalSettings.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 dark:text-white p-1 transition-colors">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value} className="rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors">
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 transition-colors">Timezone</Label>
              <Select
                value={generalSettings.timezone}
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 dark:text-white p-1 transition-colors">
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value} className="rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors">
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
