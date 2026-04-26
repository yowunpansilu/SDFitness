import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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

export function GoalsTab() {
    const { member, token, login } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        fitnessGoal: member?.fitnessGoals?.[0] || '',
        targetWeight: member?.targetWeight?.value || '',
        timeline: '',
        activityLevel: member?.activityLevel || '',
        notes: member?.notes || '',
    });

    useEffect(() => {
        if (member) {
            setFormData(prev => ({
                ...prev,
                fitnessGoal: (member.fitnessGoals?.[0] || prev.fitnessGoal)?.replace('_', '-'),
                targetWeight: member.targetWeight?.value || prev.targetWeight,
                activityLevel: member.activityLevel || prev.activityLevel,
                notes: member.notes || prev.notes,
            }));
        }
    }, [member]);

    const handleSave = async () => {
        try {
            const response = await api.put('/auth/profile', {
                memberData: {
                    fitnessGoals: [formData.fitnessGoal.replace('-', '_')],
                    targetWeight: {
                        value: formData.targetWeight ? parseFloat(formData.targetWeight.toString()) : undefined,
                        unit: member?.targetWeight?.unit || 'kg'
                    },
                    activityLevel: formData.activityLevel,
                    notes: formData.notes
                }
            });

            if (response.data.success && token) {
                login(response.data.user, token, response.data.member);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating goals:', error);
            alert('Failed to update goals. Please try again.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <Card className="border-border">
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Fitness Goal */}
                        <div className="space-y-2">
                            <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                            <Select
                                value={formData.fitnessGoal}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, fitnessGoal: value })
                                }
                                disabled={!isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your goal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                                    <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="endurance">Endurance</SelectItem>
                                    <SelectItem value="strength">Strength</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Target Weight */}
                        <div className="space-y-2">
                            <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                            <Input
                                id="targetWeight"
                                type="number"
                                placeholder=""
                                value={formData.targetWeight}
                                onChange={(e) =>
                                    setFormData({ ...formData, targetWeight: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2">
                            <Label htmlFor="timeline">Timeline</Label>
                            <Select
                                value={formData.timeline}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, timeline: value })
                                }
                                disabled={!isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timeline" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-month">1 Month</SelectItem>
                                    <SelectItem value="3-months">3 Months</SelectItem>
                                    <SelectItem value="6-months">6 Months</SelectItem>
                                    <SelectItem value="1-year">1 Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Activity Level */}
                        <div className="space-y-2">
                            <Label htmlFor="activityLevel">Activity Level</Label>
                            <Select
                                value={formData.activityLevel}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, activityLevel: value })
                                }
                                disabled={!isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activity level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                                    <SelectItem value="very-active">Very Active (2x per day)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder=""
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            disabled={!isEditing}
                            rows={4}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {!isEditing ? (
                            <Button variant="gym" onClick={() => setIsEditing(true)}>
                                Edit Goals
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
