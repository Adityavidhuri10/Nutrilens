import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import GoalForm from '../components/goals/GoalForm';
import { Target, ArrowLeft, ShieldAlert, Sparkles, Flame, Check, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GoalsPage = () => {
  const { user, updateUser } = useAuthStore();
  const [activeGoals, setActiveGoals] = useState(user?.goals || {
    calories: 2000,
    protein: 130,
    carbohydrate: 220,
    fat: 70,
    fiber: 30,
  });
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/me');
        setProfileData(data.data);
        setActiveGoals(data.data.goals || activeGoals);
        updateUser(data.data);
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

  const computedTdee = profileData?.computed?.tdee || 2000;

  // Pre-calculated templates based on TDEE
  const templates = [
    {
      id: 'weight_loss',
      label: 'Weight Loss (Deficit)',
      description: 'Consume 500 kcal below your energy expenditure to drop ~0.5 kg weekly.',
      calories: Math.max(1200, Math.round(computedTdee - 500)),
      protein: Math.round(profileData?.profile?.weight * 2.0) || 140,
      carbohydrate: Math.round((Math.max(1200, computedTdee - 500) * 0.45) / 4),
      fat: Math.round((Math.max(1200, computedTdee - 500) * 0.25) / 9),
      fiber: 30,
    },
    {
      id: 'maintenance',
      label: 'Maintain Weight (Balance)',
      description: 'Align targets with physical baseline to stabilize active weight.',
      calories: Math.round(computedTdee),
      protein: Math.round(profileData?.profile?.weight * 1.6) || 120,
      carbohydrate: Math.round((computedTdee * 0.50) / 4),
      fat: Math.round((computedTdee * 0.25) / 9),
      fiber: 30,
    },
    {
      id: 'muscle_gain',
      label: 'Muscle Gain (Surplus)',
      description: 'Provide 300 kcal energy surplus coupled with high protein target.',
      calories: Math.round(computedTdee + 300),
      protein: Math.round(profileData?.profile?.weight * 2.2) || 160,
      carbohydrate: Math.round(((computedTdee + 300) * 0.50) / 4),
      fat: Math.round(((computedTdee + 300) * 0.25) / 9),
      fiber: 35,
    },
  ];

  const handleApplyTemplate = async (template) => {
    try {
      const goalsData = {
        calories: template.calories,
        protein: template.protein,
        carbohydrate: template.carbohydrate,
        fat: template.fat,
        fiber: template.fiber,
      };

      const { data } = await api.put('/me/goals', goalsData);
      updateUser(data.data);
      setActiveGoals(data.data.goals);
      toast.success(`${template.label} template applied!`);
    } catch (err) {
      toast.error(err.message || 'Failed to apply goal template');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading goal modules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex flex-col">
      {/* Premium Apple/Notion styled Header */}
      <header className="px-6 lg:px-16 h-16 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-lg bg-white shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm">
              NL
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              NutriLens<span className="text-emerald-500">AI</span>
            </span>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
          Goal Engine Enabled
        </span>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 space-y-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
            Goal Management System
          </h1>
          <p className="text-slate-500 text-sm">
            Dynamically calculate targets based on your physical metrics or set customized parameters
          </p>
        </div>

        {/* TDEE Summary Banner */}
        <div className="health-card bg-emerald-50/20 border-emerald-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Derived Energy Level (TDEE)</h3>
              <p className="text-slate-500 text-xs mt-0.5 max-w-lg">
                Your calculated daily caloric maintenance based on profile data ({profileData?.profile?.weight}kg, {profileData?.profile?.height}cm, {profileData?.profile?.age} years, {profileData?.profile?.activityLevel}).
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-1 bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-2xl font-black text-slate-900">{computedTdee}</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">kcal/day</span>
          </div>
        </div>

        {/* Dynamic AI Templates Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Auto-Calculated Templates
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((tmpl) => {
              const isActive =
                activeGoals.calories === tmpl.calories &&
                activeGoals.protein === tmpl.protein &&
                activeGoals.carbohydrate === tmpl.carbohydrate &&
                activeGoals.fat === tmpl.fat &&
                activeGoals.fiber === tmpl.fiber;

              return (
                <div
                  key={tmpl.id}
                  className={`health-card bg-white p-5 flex flex-col justify-between border transition-all ${
                    isActive ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-sm">{tmpl.label}</h4>
                      {isActive && (
                        <span className="badge-active bg-emerald-50 text-emerald-700 text-[10px] py-0.5 px-2 font-bold flex items-center gap-1 border border-emerald-200">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{tmpl.description}</p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wide">
                          Calories
                        </span>
                        <span className="font-bold text-slate-800">{tmpl.calories} kcal</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wide">
                          Protein
                        </span>
                        <span className="font-bold text-slate-800">{tmpl.protein}g</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wide">
                          Carbs
                        </span>
                        <span className="font-bold text-slate-800">{tmpl.carbohydrate}g</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wide">
                          Fat
                        </span>
                        <span className="font-bold text-slate-800">{tmpl.fat}g</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyTemplate(tmpl)}
                    disabled={isActive}
                    className={`w-full mt-5 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-slate-50 border border-slate-200 text-slate-400 pointer-events-none'
                        : 'bg-slate-900 hover:bg-slate-850 text-white shadow-sm'
                    }`}
                  >
                    Apply Target
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Form Component */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Customize Goals Manually
            </h3>
          </div>
          <GoalForm currentGoals={activeGoals} onGoalsUpdated={setActiveGoals} />
        </div>
      </main>
    </div>
  );
};

export default GoalsPage;
