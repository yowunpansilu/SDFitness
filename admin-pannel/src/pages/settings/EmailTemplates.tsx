import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, FileText } from 'lucide-react';

export function EmailTemplates() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Email Templates</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-0.5 transition-colors">Manage automated email communication</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 dark:bg-navy-950/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-navy-800 transition-colors">
            <div className="h-20 w-20 rounded-[2.5rem] bg-white dark:bg-navy-900 text-slate-200 dark:text-navy-800 flex items-center justify-center shadow-sm mb-6 rotate-12 transition-colors">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-3 transition-colors">Feature Under <span className="text-indigo-600 dark:text-indigo-400">Development</span></h3>
            <p className="text-slate-500 dark:text-navy-400 font-medium max-w-sm transition-colors">
              The email template editor and dynamic variables are planned for the next system update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
