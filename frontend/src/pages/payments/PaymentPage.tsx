import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function PaymentPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'payments' | 'admissions'>('payments');

  return (
    <div className="pb-32 page-animate-in bg-base min-h-screen">
      <header className="px-6 py-4 pt-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ink hover:text-brand transition-colors p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-headline font-bold text-lg text-white">Finances</h2>
        <div className="w-10" />
      </header>

      <div className="px-6 mb-6">
        <div className="flex bg-surface/20 p-1 rounded-2xl">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'payments' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted hover:text-white'}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'admissions' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted hover:text-white'}`}
            onClick={() => setActiveTab('admissions')}
          >
            Admissions
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {activeTab === 'payments' ? (
          <>
            <div className="card bg-brand-gradient text-white p-6 border-brand/20 shadow-brand-lg relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10">
                <CreditCard size={120} />
              </div>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest mb-1">Current Membership</p>
              <h3 className="text-3xl font-headline font-bold mb-4">PRO TIER</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-brand-muted">Valid until</p>
                  <p className="font-bold">Oct 24, 2026</p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Active</div>
              </div>
            </div>

            <section>
              <h3 className="section-title text-base opacity-50 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { desc: 'Monthly Pro Plan', amount: '$49.99', date: 'Sep 24, 2026', status: 'Paid' },
                  { desc: 'Personal Training Session', amount: '$80.00', date: 'Sep 15, 2026', status: 'Paid' },
                  { desc: 'Protein Shake (Cafe)', amount: '$5.50', date: 'Sep 10, 2026', status: 'Paid' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-surface/20 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                        <CheckCircle size={18} className="text-cta-light" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{item.desc}</p>
                        <p className="text-xs text-ink-muted">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{item.amount}</p>
                      <p className="text-[10px] text-cta-light font-bold uppercase tracking-widest">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h2 className="text-2xl font-headline font-bold text-white mb-2">New Gym Admission</h2>
              <p className="text-ink-muted text-sm mb-6">Complete your digital admission form and sign the required waivers to unlock access to all SDFitness Downtown facilities.</p>
              
              <Button className="w-full h-14 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold mb-4 shadow-brand transition-all active:scale-95">
                Start Admission Process
              </Button>
              <Button variant="outline" className="w-full h-14 border border-white/10 text-white rounded-2xl font-bold transition-all hover:bg-white/5">
                View Signed Waivers
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
