import { useState, useEffect } from 'react';
import { Search, Edit2, Plus, RefreshCw, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Product {
    _id: string;
    sku: string;
    itemID: string;
    name: string;
    currentPrice: number;
    imageUrl: string;
    uom: string;
    isAvailable: boolean;
    departmentId: string;
    departmentName: string;
    lastUpdated: string;
}

const DEPARTMENTS = ['Vegetables', 'Foods', 'Grocery', 'Meat & Seafood', 'Chilled', 'Frozen', 'Beverages', 'Other'];

export function FoodPrices() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [loading, setLoading] = useState(true);

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        sku: '',
        itemID: '',
        name: '',
        currentPrice: 0,
        imageUrl: '',
        uom: '',
        isAvailable: true,
        departmentId: '',
        departmentName: 'Other'
    });

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartment]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (selectedDepartment !== 'all') params.departmentName = selectedDepartment;
            if (searchQuery.trim() !== '') params.search = searchQuery;

            const res = await api.get('/prices', { params });
            // the API currently does filtering internally, but we can also filter on client-side
            let data = res.data.data || [];

            // Client side filter just in case the backend text search isn't rigorous enough
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                data = data.filter((p: Product) =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.sku && p.sku.toLowerCase().includes(q))
                );
            }

            setProducts(data);
        } catch (err) {
            const error = err as Error;
            toast({
                title: 'Sync Failed',
                description: error.message || 'Failed to sync with Atlas products',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingProduct(null);
        setFormData({
            sku: '',
            itemID: '',
            name: '',
            currentPrice: 0,
            imageUrl: '',
            uom: 'kg',
            isAvailable: true,
            departmentId: '',
            departmentName: 'Other'
        });
        setIsDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku || '',
            itemID: product.itemID || '',
            name: product.name || '',
            currentPrice: product.currentPrice || 0,
            imageUrl: product.imageUrl || '',
            uom: product.uom || '',
            isAvailable: product.isAvailable ?? true,
            departmentId: product.departmentId || '',
            departmentName: product.departmentName || 'Other'
        });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This will remove it from the Atlas database permanently.`)) return;
        try {
            await api.delete(`/prices/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
            toast({ title: 'Product Deleted', description: `${name} has been removed.` });
        } catch (err) {
            const error = err as Error;
            toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                const res = await api.put(`/prices/${editingProduct._id}`, formData);
                setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data.data : p));
                toast({ title: 'Product Updated', description: `${formData.name} was successfully modified.` });
            } else {
                const res = await api.post('/prices', formData);
                setProducts(prev => [res.data.data, ...prev]);
                toast({ title: 'Product Created', description: `${formData.name} was successfully added.` });
            }
            setIsDialogOpen(false);
        } catch (err) {
            const error = err as { response?: { data?: { error?: string } }, message: string };
            toast({
                title: 'Operation Failed',
                description: error.response?.data?.error || error.message,
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-foreground">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Atlas <span className="text-primary">Products</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm mt-1.5 opacity-80">
                        Direct CRUD interface for the external scraper database
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={fetchProducts}
                        variant="outline"
                        className="rounded-xl h-11 px-4 border-border transition-all shadow-sm"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading ? 'animate-spin' : '')} />
                    </Button>
                    <Button
                        onClick={handleAddClick}
                        className="rounded-xl shadow-lg h-11 px-8 font-semibold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 border-border shadow-sm p-1">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Query products by Name or SKU..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 bg-transparent border-none rounded-xl text-foreground text-sm font-medium placeholder:text-muted-foreground/50 outline-none"
                        />
                    </div>
                </Card>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-[180px] h-12 rounded-xl text-xs font-semibold border-border bg-card">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {DEPARTMENTS.map(dept => (
                                <SelectItem key={dept} value={dept} className="text-xs font-medium">{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Grid */}
            <Card className="border-border shadow-md overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto font-medium text-xs">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    {['Product Details', 'SKU / ItemID', 'Department', 'UOM', 'Current Price', 'Status', 'Updated', ''].map(h => (
                                        <th key={h} className="text-left text-muted-foreground p-4 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {products.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center text-muted-foreground">
                                            No products found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                                {products.map(product => (
                                    <tr key={product._id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col max-w-[250px]">
                                                <span className="text-foreground font-semibold text-sm truncate group-hover:text-primary transition-colors">{product.name}</span>
                                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                                    {product.imageUrl && <span className="text-xs bg-muted px-1.5 py-0.5 rounded border border-border">img</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground font-medium text-xs font-mono">{product.sku}</span>
                                                <span className="text-muted-foreground/50 text-xs font-mono mt-0.5">{product.itemID}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className="font-semibold capitalize text-xs bg-muted/50 border-border">
                                                {product.departmentName}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {product.uom}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-emerald-500 font-bold">LKR {product.currentPrice?.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            {product.isAvailable ? (
                                                <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-semibold gap-1 px-2 py-0.5text-xs">
                                                    <CheckCircle2 className="w-3 h-3" /> Available
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/20 font-semibold gap-1 px-2 py-0.5text-xs">
                                                    <XCircle className="w-3 h-3" /> Offline
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-xs">
                                            {new Date(product.lastUpdated).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(product)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(product._id, product.name)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-none shadow-2xl">
                    <div className="bg-primary h-1.5 w-full" />
                    <div className="p-6">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                <span className={editingProduct ? "text-primary" : "text-emerald-500"}>
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                                Modified attributes will be immediately synchronized with the external Atlas database.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">SKU (Foreign Key)</Label>
                                    <Input
                                        required
                                        placeholder="e.g. 104523"
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Item ID (Internal)</Label>
                                    <Input
                                        placeholder="e.g. ITM-99"
                                        value={formData.itemID}
                                        onChange={e => setFormData({ ...formData, itemID: e.target.value })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Product Name</Label>
                                    <Input
                                        required
                                        placeholder="e.g. Keells Fresh Carrots"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Current Price (LKR)</Label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.currentPrice}
                                        onChange={e => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Unit of Measurement (UOM)</Label>
                                    <Input
                                        placeholder="e.g. 1kg, 500g, bunch"
                                        value={formData.uom}
                                        onChange={e => setFormData({ ...formData, uom: e.target.value })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Image URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Department Name</Label>
                                    <Select
                                        value={formData.departmentName}
                                        onValueChange={v => setFormData({ ...formData, departmentName: v })}
                                    >
                                        <SelectTrigger className="h-10 text-sm font-medium rounded-xl focus:ring-primary/50">
                                            <SelectValue placeholder="Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEPARTMENTS.map(dept => (
                                                <SelectItem key={dept} value={dept} className="text-xs">{dept}</SelectItem>
                                            ))}
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Department ID</Label>
                                    <Input
                                        placeholder="e.g. DEP-001"
                                        value={formData.departmentId}
                                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="h-10 text-sm font-medium rounded-xl focus-visible:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border mt-6">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Store Availability</Label>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        Is this product currently in stock at the primary source?
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.isAvailable}
                                    onCheckedChange={checked => setFormData({ ...formData, isAvailable: checked })}
                                />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-2 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1 rounded-xl font-semibold text-xs h-11"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl font-semibold text-xs h-11 transition-all hover:scale-[1.02] shadow-md active:scale-95"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
