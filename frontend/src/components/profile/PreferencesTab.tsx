import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

import { useAuthStore } from '@/lib/stores/authStore';

export function PreferencesTab() {
    const { member, token, login } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    // Helper to format dietary preferences from backend (snake_case) to UI (Capitalized-Hyphenated)
    const formatPref = (p: string) => {
        return p.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
    };

    const [formData, setFormData] = useState({
        dietaryRestrictions: (member?.dietaryPreferences || []).map(formatPref),
        allergies: (member?.allergies || []).join(', '),
        budget: member?.dietBudget?.amount?.toString() || '200',
        workoutTime: '',
        emailNotifications: member?.notificationPreferences?.email ?? true,
        smsNotifications: member?.notificationPreferences?.sms ?? false,
        pushNotifications: member?.notificationPreferences?.push ?? true,
    });

    useEffect(() => {
        if (member) {
            setFormData(prev => ({
                ...prev,
                dietaryRestrictions: (member.dietaryPreferences || []).map(formatPref),
                allergies: (member.allergies || []).join(', '),
                budget: member.dietBudget?.amount?.toString() || prev.budget,
                emailNotifications: member.notificationPreferences?.email ?? prev.emailNotifications,
                smsNotifications: member.notificationPreferences?.sms ?? prev.smsNotifications,
                pushNotifications: member.notificationPreferences?.push ?? prev.pushNotifications,
            }));
        }
    }, [member]);

    const dietaryOptions = [
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Dairy-Free',
        'Halal',
        'Kosher',
        'None',
    ];

    const toggleDietaryRestriction = (option: string) => {
        if (!isEditing) return;

        setFormData(prev => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.includes(option)
                ? prev.dietaryRestrictions.filter((item: string) => item !== option)
                : [...prev.dietaryRestrictions, option]
        }));
    };

    const handleSave = async () => {
        try {
            const response = await api.put('/auth/profile', {
                memberData: {
                    dietaryPreferences: formData.dietaryRestrictions.map((p: string) => p.toLowerCase().replace('-', '_')),
                    allergies: formData.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a),
                    dietBudget: {
                        amount: parseFloat(formData.budget),
                        currency: member?.dietBudget?.currency || 'LKR',
                        period: member?.dietBudget?.period || 'weekly'
                    },
                    notificationPreferences: {
                        email: formData.emailNotifications,
                        sms: formData.smsNotifications,
                        push: formData.pushNotifications
                    }
                }
            });

            if (response.data.success && token) {
                login(response.data.user, token, response.data.member);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert('Failed to update preferences. Please try again.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <Card className="border-border">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Dietary Restrictions */}
                    <div className="space-y-2">
                        <Label>Dietary Restrictions</Label>
                        <div className="flex flex-wrap gap-2">
                            {dietaryOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggleDietaryRestriction(option)}
                                    disabled={!isEditing}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.dietaryRestrictions.includes(option)
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                            id="allergies"
                            placeholder=""
                            value={formData.allergies}
                            onChange={(e) =>
                                setFormData({ ...formData, allergies: e.target.value })
                            }
                            disabled={!isEditing}
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Budget */}
                        <div className="space-y-2">
                            <Label htmlFor="budget">
                                Monthly Diet Plan Budget: ${formData.budget}
                            </Label>
                            <input
                                id="budget"
                                type="range"
                                min="50"
                                max="500"
                                step="10"
                                value={formData.budget}
                                onChange={(e) =>
                                    setFormData({ ...formData, budget: e.target.value })
                                }
                                disabled={!isEditing}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>$50</span>
                                <span>$500</span>
                            </div>
                        </div>

                        {/* Preferred Workout Time */}
                        <div className="space-y-2">
                            <Label htmlFor="workoutTime">Preferred Workout Time</Label>
                            <Select
                                value={formData.workoutTime}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, workoutTime: value })
                                }
                                disabled={!isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                                    <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                                    <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="space-y-3">
                        <Label>Notification Preferences</Label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.emailNotifications}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            emailNotifications: e.target.checked,
                                        })
                                    }
                                    disabled={!isEditing}
                                    className="w-4 h-4 rounded border-border bg-muted text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                />
                                <span className="text-sm text-muted-foreground">Email Notifications</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.smsNotifications}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            smsNotifications: e.target.checked,
                                        })
                                    }
                                    disabled={!isEditing}
                                    className="w-4 h-4 rounded border-border bg-muted text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                />
                                <span className="text-sm text-muted-foreground">SMS Notifications</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.pushNotifications}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pushNotifications: e.target.checked,
                                        })
                                    }
                                    disabled={!isEditing}
                                    className="w-4 h-4 rounded border-border bg-muted text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                />
                                <span className="text-sm text-muted-foreground">Push Notifications</span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {!isEditing ? (
                            <Button variant="gym" onClick={() => setIsEditing(true)}>
                                Edit Preferences
                            </Button>
                        ) : (
                            <>
                                <Button variant="gym" onClick={handleSave}>
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
