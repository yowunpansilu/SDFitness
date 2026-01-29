import { useState, useEffect } from 'react';
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

export function HealthMetricsTab() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        height: '',
        heightUnit: 'cm',
        weight: '',
        weightUnit: 'kg',
        age: '',
        gender: '',
        bodyFat: '',
    });
    const [bmi, setBmi] = useState<number | null>(null);

    // Calculate BMI whenever height or weight changes
    useEffect(() => {
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);

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

    const handleSave = () => {
        // TODO: Save to backend
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <Card className="border-dark-700">
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
                                    placeholder="170"
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
                                    placeholder="70"
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
                                placeholder="25"
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
                                placeholder="15"
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
                            <div className="flex h-10 items-center rounded-md border border-dark-600 bg-dark-800 px-3 py-2">
                                {bmi ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-semibold">{bmi}</span>
                                        <span className={getBMICategory(bmi).color}>
                                            ({getBMICategory(bmi).text})
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">Enter height and weight</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {!isEditing ? (
                            <Button variant="gym" onClick={() => setIsEditing(true)}>
                                Edit Metrics
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
