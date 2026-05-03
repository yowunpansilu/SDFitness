import { useState } from 'react';
import api from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface WeightLog {
    _id: string;
    weight: number;
    unit: string;
    date: string;
}

export function WeightHistoryTable({ logs, onRefresh }: { logs: WeightLog[], onRefresh: () => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        try {
            await api.delete(`/progress/weight/${id}`);
            onRefresh();
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    const handleEditSave = async (id: string) => {
        if (!editValue) return;
        try {
            await api.put(`/progress/weight/${id}`, {
                weightValue: parseFloat(editValue),
            });
            setEditingId(null);
            onRefresh();
        } catch (error) {
            console.error('Error updating log:', error);
        }
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Log History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {logs.map((log) => (
                        <div key={log._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                    {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {editingId === log._id ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-20 h-8 text-right"
                                            autoFocus
                                        />
                                        <span className="text-sm text-muted-foreground mr-2">{log.unit}</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => handleEditSave(log._id)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-lg font-bold text-foreground">
                                            {log.weight.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{log.unit}</span>
                                        </span>
                                        <div className="flex gap-1 ml-4 opactiy-50 hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditingId(log._id); setEditValue(log.weight.toString()); }}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-rose-500" onClick={() => handleDelete(log._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {logs.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            No logs found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
