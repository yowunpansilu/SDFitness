import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api/axios';
import { Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export function PersonalInfoTab() {
    const { user, token, login } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || prev.firstName,
                lastName: user.lastName || prev.lastName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
            }));
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const response = await api.put('/auth/profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone
            });

            if (response.data.success && token) {
                // Update local store with data from server
                login(response.data.user, token, response.data.member);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating personal info:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setIsEditing(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG or GIF).');
            return;
        }

        // Check size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large. Max size is 2MB.');
            return;
        }

        setIsUploadingPhoto(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const response = await api.put('/auth/profile', {
                    avatar: base64String
                });

                if (response.data.success && token) {
                    login(response.data.user, token, response.data.member);
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Failed to upload photo. Please try again.');
            } finally {
                setIsUploadingPhoto(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <Card className="border-border">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="text-2xl">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <input 
                                type="file" 
                                accept="image/jpeg, image/png, image/gif" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handlePhotoUpload} 
                            />
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                            >
                                <Camera className="h-4 w-4" />
                                {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                JPG, PNG or GIF. Max size 2MB.
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="opacity-60"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder=""
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {!isEditing ? (
                            <div className="flex gap-3">
                                <Button variant="gym" onClick={() => setIsEditing(true)}>
                                    Edit Profile
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
