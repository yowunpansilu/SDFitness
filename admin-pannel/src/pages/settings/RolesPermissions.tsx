import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';

export function RolesPermissions() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <Card className="bg-white dark:bg-white border-navy-100/50 dark:border-slate-300 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-900 uppercase tracking-tight transition-colors">Security Matrix</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-700 dark:text-slate-700 uppercase tracking-widest mt-0.5 transition-colors">Role-based access control and authority levels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 dark:bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-300 transition-colors">
            <div className="h-20 w-20 rounded-[2.5rem] bg-white dark:bg-white text-slate-200 dark:text-slate-900 flex items-center justify-center shadow-sm mb-6 transition-all hover:scale-110 duration-500">
              <Users className="h-10 w-10 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-900 uppercase tracking-tight mb-3 transition-colors">Authority <span className="text-violet-600 dark:text-violet-400 italic">Sync</span></h3>
            <p className="text-slate-500 dark:text-slate-600 font-medium italic max-w-sm transition-colors">
              Granular permission matrices and multi-tiered role assignment protocols are currently being engineered for Phase 3 deployment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
