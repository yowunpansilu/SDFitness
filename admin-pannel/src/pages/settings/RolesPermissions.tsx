import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';

export function RolesPermissions() {
    return (
        <div className="space-y-6">
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">Roles & Permissions</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                        Manage user roles and access permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-dark-800 mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                        <p className="text-gray-400 max-w-md">
                            Role management and permission matrix for controlling user access will be available in Phase 3.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
