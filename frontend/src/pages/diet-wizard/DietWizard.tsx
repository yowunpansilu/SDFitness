import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaveDietPlan } from '@/hooks/queries/useDietQueries';

export function DietWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    goal: '',
    dietType: '',
    allergies: [] as string[]
  });

  const { mutate: savePlan } = useSaveDietPlan();

  const generatePlan = () => {
    setLoading(true);
    
    // Construct a basic plan based on preferences
    const planData = {
      name: `${preferences.dietType} ${preferences.goal.charAt(0).toUpperCase() + preferences.goal.slice(1)} Plan`,
      goal: preferences.goal,
      dietType: preferences.dietType.toLowerCase(),
      targetCalories: preferences.goal === 'bulk' ? 2800 : preferences.goal === 'cut' ? 1800 : 2200,
      isActive: true,
      // The hook will add memberId automatically
    };

    savePlan(planData, {
      onSuccess: () => {
        setLoading(false);
        navigate('/diet');
      },
      onError: () => {
        setLoading(false);
        // Fallback or error toast could go here
        navigate('/diet');
      }
    });
  };

  const commonAllergies = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="px-6 py-4 pt-10 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-ink-muted hover:text-white transition-colors p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-1">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${step >= i ? 'bg-brand' : 'bg-white/10'}`} />
          ))}
        </div>
        <div className="w-10 flex justify-end text-brand">
          <Sparkles size={20} />
        </div>
      </header>

      <div className="flex-1 px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-headline text-3xl font-bold mb-2">What is your primary goal?</h1>
              <p className="text-ink-muted">This helps our AI calibrate your daily macros.</p>
            </div>
            <div className="space-y-3">
              {[
                { id: 'cut', title: 'Fat Loss', desc: 'Caloric deficit for shedding weight' },
                { id: 'maintain', title: 'Maintenance', desc: 'Keep current weight, improve health' },
                { id: 'bulk', title: 'Muscle Gain', desc: 'Caloric surplus to build strength' }
              ].map(goal => (
                <div 
                  key={goal.id}
                  onClick={() => setPreferences({ ...preferences, goal: goal.id })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${preferences.goal === goal.id ? 'border-brand bg-brand/10' : 'border-white/5 bg-surface/20'}`}
                >
                  <div>
                    <h3 className="font-bold text-white mb-1">{goal.title}</h3>
                    <p className="text-sm text-ink-muted">{goal.desc}</p>
                  </div>
                  {preferences.goal === goal.id && <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center"><Check size={14} /></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="font-headline text-3xl font-bold mb-2">Preferred Diet Type</h1>
              <p className="text-ink-muted">Any specific way you prefer to eat?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Standard', 'Keto', 'Paleo', 'Vegan', 'Vegetarian', 'Pescatarian'].map(diet => (
                <div 
                  key={diet}
                  onClick={() => setPreferences({ ...preferences, dietType: diet })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${preferences.dietType === diet ? 'border-brand bg-brand/10 text-white' : 'border-white/5 bg-surface/20 text-ink-muted hover:text-white'}`}
                >
                  <span className="font-bold text-sm tracking-wide">{diet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="font-headline text-3xl font-bold mb-2">Any allergies?</h1>
              <p className="text-ink-muted">Select all that apply so we can exclude them.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonAllergies.map(allergy => {
                const selected = preferences.allergies.includes(allergy);
                return (
                  <div 
                    key={allergy}
                    onClick={() => {
                      if (selected) {
                        setPreferences({ ...preferences, allergies: preferences.allergies.filter(a => a !== allergy) });
                      } else {
                        setPreferences({ ...preferences, allergies: [...preferences.allergies, allergy] });
                      }
                    }}
                    className={`px-4 py-2 rounded-full border transition-all cursor-pointer text-sm font-bold ${selected ? 'border-brand bg-brand text-white shadow-brand' : 'border-white/10 bg-surface/10 text-ink-muted hover:text-white hover:bg-white/5'}`}
                  >
                    {allergy}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {step < 3 ? (
          <Button 
            className="w-full h-14 bg-white hover:bg-ink-faint text-ink-strong rounded-2xl font-bold text-base justify-between px-6 transition-all active:scale-95 shadow-md"
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !preferences.goal || step === 2 && !preferences.dietType}
          >
            Continue <ChevronRight size={20} />
          </Button>
        ) : (
          <Button 
            className="w-full h-14 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold text-base transition-all active:scale-95 shadow-brand flex gap-2"
            onClick={generatePlan}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse flex items-center justify-center gap-2 w-full">
                <Sparkles size={18} className="animate-spin" /> Generating AI Diet Plan...
              </span>
            ) : (
              'Generate Diet Plan'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
