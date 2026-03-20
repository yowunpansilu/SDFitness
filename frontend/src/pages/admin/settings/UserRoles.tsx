import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Save, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Role {
    id: string;
    name: string;
    description: string;
    isCustom: boolean;
    permissions: Record<string, string[]>;
}

const DEFAULT_ROLES: Role[] = [
    {
        id: 'admin',
        name: 'Admin',
        description: 'Full access to all features and settings',
        isCustom: false,
        permissions: {
            members: ['view', 'create', 'edit', 'delete'],
            trainers: ['view', 'create', 'edit', 'delete'],
            classes: ['view', 'create', 'edit', 'delete'],
            payments: ['view', 'create', 'refund'],
            equipment: ['view', 'create', 'edit', 'delete'],
            analytics: ['view'],
            settings: ['view', 'edit'],
        },
    },
    {
        id: 'manager',
        name: 'Manager',
        description: 'Manage members, classes, and payments',
        isCustom: false,
        permissions: {
            members: ['view', 'create', 'edit'],
            trainers: ['view'],
            classes: ['view', 'create', 'edit'],
            payments: ['view', 'create'],
            equipment: ['view', 'edit'],
            analytics: ['view'],
            settings: [],
        },
    },
    {
        id: 'receptionist',
        name: 'Receptionist',
        description: 'Check-in members and book classes',
        isCustom: false,
        permissions: {
            members: ['view'],
            trainers: ['view'],
            classes: ['view', 'create'],
            payments: ['view'],
            equipment: ['view'],
            analytics: [],
            settings: [],
        },
    },
    {
        id: 'trainer',
        name: 'Trainer',
        description: 'View assigned members and classes',
        isCustom: false,
        permissions: {
            members: ['view'],
            trainers: [],
            classes: ['view'],
            payments: [],
            equipment: ['view'],
            analytics: [],
            settings: [],
        },
    },
];

const PERMISSION_CATEGORIES = [
    { id: 'members', name: 'Members', permissions: ['view', 'create', 'edit', 'delete'] },
    { id: 'trainers', name: 'Trainers', permissions: ['view', 'create', 'edit', 'delete'] },
    { id: 'classes', name: 'Classes', permissions: ['view', 'create', 'edit', 'delete'] },
    { id: 'payments', name: 'Payments', permissions: ['view', 'create', 'refund'] },
    { id: 'equipment', name: 'Equipment', permissions: ['view', 'create', 'edit', 'delete'] },
    { id: 'analytics', name: 'Analytics', permissions: ['view'] },
    { id: 'settings', name: 'Settings', permissions: ['view', 'edit'] },
];

export function UserRoles() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState({
        name: '',
        description: '',
        permissions: {} as Record<string, string[]>,
    });

    const handlePermissionToggle = (roleId: string, category: string, permission: string) => {
        setRoles(roles.map(role => {
            if (role.id === roleId) {
                const categoryPermissions = role.permissions[category] || [];
                const hasPermission = categoryPermissions.includes(permission);

                return {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        [category]: hasPermission
                            ? categoryPermissions.filter(p => p !== permission)
                            : [...categoryPermissions, permission],
                    },
                };
            }
            return role;
        }));
    };

    const handleCreateRole = () => {
        if (!newRole.name) {
            toast({
                title: 'Error',
                description: 'Please enter a role name',
                variant: 'destructive',
            });
            return;
        }

        const role: Role = {
            id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
            name: newRole.name,
            description: newRole.description,
            isCustom: true,
            permissions: newRole.permissions,
        };

        setRoles([...roles, role]);
        setNewRole({ name: '', description: '', permissions: {} });
        setIsCreateDialogOpen(false);

        toast({
            title: 'Role Created',
            description: `${newRole.name} role has been created successfully`,
        });
    };

    const handleDeleteRole = (roleId: string) => {
        setRoles(roles.filter(role => role.id !== roleId));
        toast({
            title: 'Role Deleted',
            description: 'The custom role has been deleted',
        });
    };

    const handleNewRolePermissionToggle = (category: string, permission: string) => {
        const categoryPermissions = newRole.permissions[category] || [];
        const hasPermission = categoryPermissions.includes(permission);

        setNewRole({
            ...newRole,
            permissions: {
                ...newRole.permissions,
                [category]: hasPermission
                    ? categoryPermissions.filter(p => p !== permission)
                    : [...categoryPermissions, permission],
            },
        });
    };

    const handleSave = () => {
        toast({
            title: 'Roles Saved',
            description: 'User roles and permissions have been updated successfully',
        });
    };

    return (
        <div className="space-y-6">
            {/* Role Cards Overview */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">User Roles</h3>
                    <p className="text-sm text-muted-foreground">Manage roles and their permissions</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-foreground">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Custom Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Custom Role</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Define a new role with specific permissions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="role-name">Role Name</Label>
                                <Input
                                    id="role-name"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                    placeholder="e.g., Front Desk Staff"
                                    className="bg-card border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role-description">Description</Label>
                                <Textarea
                                    id="role-description"
                                    value={newRole.description}
                                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                    placeholder="Describe what this role can do"
                                    className="bg-card border-border text-foreground resize-none"
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Permissions</Label>
                                {PERMISSION_CATEGORIES.map(category => (
                                    <div key={category.id} className="space-y-2">
                                        <div className="font-medium text-muted-foreground">{category.name}</div>
                                        <div className="flex flex-wrap gap-4 pl-4">
                                            {category.permissions.map(permission => (
                                                <div key={permission} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`new-${category.id}-${permission}`}
                                                        checked={(newRole.permissions[category.id] || []).includes(permission)}
                                                        onCheckedChange={() => handleNewRolePermissionToggle(category.id, permission)}
                                                    />
                                                    <label
                                                        htmlFor={`new-${category.id}-${permission}`}
                                                        className="text-sm text-muted-foreground capitalize cursor-pointer"
                                                    >
                                                        {permission}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="bg-card border-border text-muted-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateRole}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                            >
                                Create Role
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role) => (
                    <Card key={role.id} className="bg-background/50 border-border hover:border-purple-500/30 transition-all duration-300">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20">
                                        <Shield className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-foreground text-base">{role.name}</CardTitle>
                                        {role.isCustom && (
                                            <Badge variant="outline" className="mt-1 text-xs border-purple-500/30 text-purple-400">
                                                Custom
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {role.isCustom && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <CardDescription className="text-muted-foreground text-sm">
                                {role.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {PERMISSION_CATEGORIES.map(category => {
                                    const permissions = role.permissions[category.id] || [];
                                    return permissions.length > 0 && (
                                        <div key={category.id} className="text-xs text-muted-foreground">
                                            <span className="font-medium text-muted-foreground">{category.name}:</span>{' '}
                                            {permissions.join(', ')}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Permission Matrix */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Permission Matrix</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Configure permissions for each role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Feature</th>
                                    {roles.map(role => (
                                        <th key={role.id} className="text-center py-3 px-2 text-muted-foreground font-medium min-w-[100px]">
                                            {role.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSION_CATEGORIES.map(category => (
                                    <tr key={category.id} className="border-b border-border/50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-foreground">{category.name}</div>
                                                <div className="text-xs text-muted-foreground">{category.permissions.join(', ')}</div>
                                            </div>
                                        </td>
                                        {roles.map(role => (
                                            <td key={role.id} className="py-3 px-2">
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {category.permissions.map(permission => (
                                                        <Checkbox
                                                            key={permission}
                                                            id={`${role.id}-${category.id}-${permission}`}
                                                            checked={(role.permissions[category.id] || []).includes(permission)}
                                                            onCheckedChange={() => handlePermissionToggle(role.id, category.id, permission)}
                                                            disabled={!role.isCustom && role.id === 'admin'}
                                                            title={permission}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        Note: Admin role permissions cannot be modified
                    </p>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-foreground"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Roles
                </Button>
            </div>
        </div>
    );
}
