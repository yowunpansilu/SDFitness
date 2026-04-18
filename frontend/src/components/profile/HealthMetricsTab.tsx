import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

import { useAuthStore } from '@/lib/stores/authStore';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export function HealthMetricsTab() {
    const { member, token, login } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        height: member?.height?.value || '',
        heightUnit: member?.height?.unit || 'cm',
        weight: member?.currentWeight?.value || '',
        weightUnit: member?.currentWeight?.unit || 'kg',
        age: '', // Age is handled via DOB calculation usually, but I'll add a helper or just leave for now
        gender: member?.gender || '',
        bodyFat: member?.bodyFatPercentage || '',
    });

    // Sync form data with member when it becomes available
    useEffect(() => {
        if (member) {
            setFormData(prev => ({
                ...prev,
                height: member.height?.value || prev.height,
                heightUnit: member.height?.unit || prev.heightUnit,
                weight: member.currentWeight?.value || prev.weight,
                weightUnit: member.currentWeight?.unit || prev.weightUnit,
                gender: member.gender || prev.gender,
                bodyFat: member.bodyFatPercentage || prev.bodyFat,
            }));
        }
    }, [member]);

    // Handle Age calculation if dateOfBirth exists
    useEffect(() => {
        if (member?.dateOfBirth) {
            const birthDate = new Date(member.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, age: age.toString() }));
        }
    }, [member]);

    const [bmi, setBmi] = useState<number | null>(null);

    // Calculate BMI whenever height or weight changes
    useEffect(() => {
        const height = parseFloat(formData.height.toString());
        const weight = parseFloat(formData.weight.toString());

        if (height && weight) {
            let heightInMeters = height;
            let weightInKg = weight;

            // Convert to metric if needed
            if (formData.heightUnit === 'ft') {
                heightInMeters = height * 0.3048;
            } else {
                heightInMeters = height / 100;
            }

            if (formData.weightUnit === 'lbs') {
                weightInKg = weight * 0.453592;
            }

            const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
            setBmi(Math.round(calculatedBMI * 10) / 10);
        } else {
            setBmi(null);
        }
    }, [formData.height, formData.weight, formData.heightUnit, formData.weightUnit]);

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-500' };
        if (bmi < 25) return { text: 'Normal', color: 'text-green-500' };
        if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-500' };
        return { text: 'Obese', color: 'text-red-500' };
    };

    const handleSave = async () => {
        try {
            const h = parseFloat(formData.height.toString());
            const w = parseFloat(formData.weight.toString());
            
            const response = await api.put('/auth/profile', {
                memberData: {
                    height: {
                        value: h,
                        unit: formData.heightUnit
                    },
                    currentWeight: {
                        value: w,
                        unit: formData.weightUnit
                    },
                    gender: formData.gender,
                    bodyFatPercentage: formData.bodyFat ? parseFloat(formData.bodyFat.toString()) : undefined
                }
            });

            if (response.data.success && token) {
                login(response.data.user, token, response.data.member);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating health metrics:', error);
            alert('Failed to update health metrics. Please try again.');
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
                        {/* Height */}
                        <div className="space-y-2">
                            <Label htmlFor="height">Height</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="height"
                                    type="number"
                                    placeholder=""
                                    value={formData.height}
                                    onChange={(e) =>
                                        setFormData({ ...formData, height: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    className="flex-1"
                                />
                                <Select
                                    value={formData.heightUnit}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, heightUnit: value })
                                    }
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cm">cm</SelectItem>
                                        <SelectItem value="ft">ft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder=""
                                    value={formData.weight}
                                    onChange={(e) =>
                                        setFormData({ ...formData, weight: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    className="flex-1"
                                />
                                <Select
                                    value={formData.weightUnit}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, weightUnit: value })
                                    }
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="lbs">lbs</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder=""
                                value={formData.age}
                                onChange={(e) =>
                                    setFormData({ ...formData, age: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, gender: value })
                                }
                                disabled={!isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Body Fat % */}
                        <div className="space-y-2">
                            <Label htmlFor="bodyFat">Body Fat % (Optional)</Label>
                            <Input
                                id="bodyFat"
                                type="number"
                                placeholder=""
                                value={formData.bodyFat}
                                onChange={(e) =>
                                    setFormData({ ...formData, bodyFat: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        {/* BMI Display */}
                        <div className="space-y-2">
                            <Label>BMI (Calculated)</Label>
                            <div className="flex h-10 items-center rounded-md border border-border bg-card px-3 py-2">
                                {bmi ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-foreground font-semibold">{bmi}</span>
                                        <span className={getBMICategory(bmi).color}>
                                            ({getBMICategory(bmi).text})
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">Enter height and weight</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {!isEditing ? (
                            <div className="flex gap-3">
                                <Button variant="gym" onClick={() => setIsEditing(true)}>
                                    Edit Metrics
                                </Button>
                                <DeleteAccountDialog />
                            </div>
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
