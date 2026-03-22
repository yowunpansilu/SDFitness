import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';

export function RolesPermissions() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Security Matrix</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">Role-based access control and authority levels</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-white text-slate-200 flex items-center justify-center shadow-sm mb-6 transition-transform hover:scale-110 duration-500">
                            <Users className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Authority <span className="text-violet-600 italic">Sync</span></h3>
                        <p className="text-slate-500 font-medium italic max-w-sm">
                            Granular permission matrices and multi-tiered role assignment protocols are currently being engineered for Phase 3 deployment.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
