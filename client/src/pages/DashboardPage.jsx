import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { LogOut, User, Activity, Dumbbell, Target, Settings, ArrowRight, Plus, Calendar, Utensils, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = selectedDate === todayStr;
        
        const summaryUrl = isToday 
          ? '/dashboard/today' 
          : `/meals/daily-summary?date=${selectedDate}`;

        const [profileRes, summaryRes, insightsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get(summaryUrl),
          api.get('/insights'),
        ]);
        setProfileData(profileRes.data.data);
        setDailySummary(summaryRes.data.data);
        setInsights(insightsRes.data.data);
        updateUser(profileRes.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, updateUser]);

  // Refetch summary when date changes (without full loading state)
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = newDate === todayStr;
      
      const summaryUrl = isToday 
        ? '/dashboard/today' 
        : `/meals/daily-summary?date=${newDate}`;

      const { data } = await api.get(summaryUrl);
      setDailySummary(data.data);
    } catch {
      toast.error('Failed to load daily summary');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (e) {
      toast.error('Logout error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const goals = profileData?.goals || { calories: 2000, protein: 130, carbohydrate: 220, fat: 70, fiber: 30 };
  const totals = dailySummary?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  const computedBmr = profileData?.computed?.bmr || 0;
  const computedTdee = profileData?.computed?.tdee || 0;

  // Calculate progress percentages
  const calcProgress = (consumed, goal) => goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;

  const macros = [
    { label: 'Calories', consumed: totals.calories, goal: goals.calories, unit: 'kcal', color: 'bg-emerald-500' },
    { label: 'Protein', consumed: totals.protein, goal: goals.protein, unit: 'g', color: 'bg-blue-500' },
    { label: 'Carbs', consumed: totals.carbs, goal: goals.carbohydrate, unit: 'g', color: 'bg-amber-500' },
    { label: 'Fats', consumed: totals.fats, goal: goals.fat, unit: 'g', color: 'bg-rose-500' },
    { label: 'Fiber', consumed: totals.fiber, goal: goals.fiber, unit: 'g', color: 'bg-green-500' },
  ];

  const getMealTypeEmoji = (type) => {
    switch (type) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🥗';
      case 'dinner': return '🍛';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex flex-col">
      {/* Header */}
      <header className="px-6 lg:px-16 h-16 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm">
            NL
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            NutriLens<span className="text-emerald-500">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-sm font-medium text-slate-600">
            <span className="font-bold text-slate-950">{user?.name}</span>
          </span>
          <Link
            to="/meals"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 font-bold shadow-sm"
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-500" />
            Meals
          </Link>
          <Link
            to="/meals/upload"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-transparent bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-xs font-bold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Meal
          </Link>
          <Link
            to="/goals"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 font-bold shadow-sm"
          >
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            Goals
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 font-bold shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-red-600 font-bold shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 space-y-8">
        {/* Title + Date Picker */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
              {isToday ? "Today's Nutrition" : `Nutrition for ${new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`}
            </h1>
            <p className="text-slate-500 text-sm">
              {dailySummary?.mealCount || 0} {(dailySummary?.mealCount || 0) === 1 ? 'meal' : 'meals'} logged
              {isToday ? ' today' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
              />
            </div>
            {!isToday && (
              <button
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Macro Progress Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {macros.map((macro) => {
            const progress = calcProgress(macro.consumed, macro.goal);
            const isOver = macro.consumed > macro.goal;

            return (
              <div key={macro.label} className="health-card bg-white p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{macro.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isOver ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {progress}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-black text-slate-900">{macro.consumed}</span>
                  <span className="text-slate-400 text-[10px] font-bold">/ {macro.goal}{macro.unit}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : macro.color}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nutrition Insights (Only displayed when date is today) */}
        {isToday && insights && (
          <div className="health-card bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-100/60 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Nutrition Insights</h3>
                <p className="text-slate-500 text-xs">Deterministic rules-based feedback based on today's target goals</p>
              </div>
            </div>

            <div className="grid md:col-span-12 gap-6">
              {/* Score Dial */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-white/60 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Score</span>
                <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-500/20">
                  <span className="text-xl font-black text-slate-900">{insights.score}%</span>
                </div>
              </div>

              {/* Warnings and Suggestions */}
              <div className="md:col-span-9 space-y-4">
                {insights.warnings.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Nutrition Warnings</span>
                    <ul className="space-y-1.5 text-xs text-slate-750 list-disc pl-4">
                      {insights.warnings.map((w, idx) => (
                        <li key={idx} className="font-medium text-red-600">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Improvement Suggestions</span>
                  <ul className="space-y-1.5 text-xs text-slate-750 list-disc pl-4">
                    {insights.suggestions.map((s, idx) => (
                      <li key={idx} className="font-medium">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BMR/TDEE + Quick Actions Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* BMR Card */}
          <div className="health-card bg-white p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">BMR</h3>
                <p className="text-slate-400 text-[10px]">Basal Metabolic Rate</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{computedBmr}</span>
              <span className="text-slate-400 text-xs font-semibold">kcal/day</span>
            </div>
          </div>

          {/* TDEE Card */}
          <div className="health-card bg-white p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">TDEE</h3>
                <p className="text-slate-400 text-[10px]">Total Daily Energy</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{computedTdee}</span>
              <span className="text-slate-400 text-xs font-semibold">kcal/day</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="health-card bg-emerald-50/30 border-emerald-100 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                <p className="text-slate-400 text-[10px]">Log & track your nutrition</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/meals/upload"
                className="btn-primary text-center py-2.5 text-xs font-extrabold shadow-sm"
              >
                Log New Meal
              </Link>
              <Link
                to="/goals"
                className="btn-secondary text-center py-2 text-xs font-bold"
              >
                Update Goals
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Meals for This Day */}
        <div className="health-card bg-white p-6 md:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isToday ? "Today's Meals" : 'Meals This Day'}
                </h3>
                <p className="text-slate-500 text-xs">{dailySummary?.mealCount || 0} entries</p>
              </div>
            </div>
            <Link
              to="/meals"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100/60 transition-colors"
            >
              View All History
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!dailySummary?.meals || dailySummary.meals.length === 0) ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">No meals logged</h4>
              <p className="text-slate-500 text-xs mb-4">
                {isToday ? 'Start logging your meals to track nutrition' : 'No meals were logged on this date'}
              </p>
              {isToday && (
                <Link
                  to="/meals/upload"
                  className="btn-primary inline-flex items-center gap-1.5 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log First Meal
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {dailySummary.meals.map((meal) => (
                <div key={meal._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                  {/* Meal Image Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                    <img
                      src={meal.image.url}
                      alt={meal.mealType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Meal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getMealTypeEmoji(meal.mealType)}</span>
                      <span className="font-bold text-slate-900 text-sm capitalize">{meal.mealType}</span>
                      <span className="text-slate-400 text-[10px] font-semibold">{formatTime(meal.date)}</span>
                    </div>
                    {meal.nutrition?.foodItems?.length > 0 && (
                      <p className="text-slate-500 text-xs truncate">
                        {meal.nutrition.foodItems.join(', ')}
                      </p>
                    )}
                  </div>
                  {/* Macro Summary */}
                  {meal.nutrition && meal.nutrition.analysisStatus !== 'failed' && (
                    <div className="hidden sm:flex items-center gap-4 text-xs shrink-0">
                      <div className="text-center">
                        <span className="block font-black text-slate-900">{meal.nutrition.calories}</span>
                        <span className="text-[9px] text-slate-400 font-bold">kcal</span>
                      </div>
                      <div className="text-center">
                        <span className="block font-black text-slate-900">{meal.nutrition.protein}g</span>
                        <span className="text-[9px] text-blue-400 font-bold">P</span>
                      </div>
                      <div className="text-center">
                        <span className="block font-black text-slate-900">{meal.nutrition.carbs}g</span>
                        <span className="text-[9px] text-amber-400 font-bold">C</span>
                      </div>
                      <div className="text-center">
                        <span className="block font-black text-slate-900">{meal.nutrition.fats}g</span>
                        <span className="text-[9px] text-rose-400 font-bold">F</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
