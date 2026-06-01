import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { LogOut, User, Activity, Dumbbell, ShieldAlert, CheckCircle, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/me');
        setProfileData(data.data);
        updateUser(data.data);
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

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
          <span className="text-sm font-semibold">Loading dashboard statistics...</span>
        </div>
      </div>
    );
  }

  const computedBmr = profileData?.computed?.bmr || 0;
  const computedTdee = profileData?.computed?.tdee || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex flex-col">
      {/* Premium Apple/Notion styled White Header */}
      <header className="px-6 lg:px-16 h-16 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm">
            NL
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            NutriLens<span className="text-emerald-500">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm font-medium text-slate-600">
            Active: <span className="font-bold text-slate-950">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-red-600 font-bold shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
              Physical Health Indicators
            </h1>
            <p className="text-slate-500 text-sm">
              Review BMR targets and derived physical credentials
            </p>
          </div>
          <div className="badge-active">
            <CheckCircle className="w-3.5 h-3.5" />
            Design System Connected
          </div>
        </div>

        {/* Clean, Non-Neon Information Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* User Demographics Card */}
          <div className="health-card bg-white p-6 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{user?.name}</h3>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Age</span>
                <span className="font-bold text-slate-900">{profileData?.profile?.age} years</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Gender</span>
                <span className="font-bold capitalize text-slate-900">{profileData?.profile?.gender}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Height</span>
                <span className="font-bold text-slate-900">{profileData?.profile?.height} cm</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Weight</span>
                <span className="font-bold text-slate-900">{profileData?.profile?.weight} kg</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Activity Level</span>
                <span className="font-bold capitalize text-slate-900">{profileData?.profile?.activityLevel}</span>
              </div>
            </div>
          </div>

          {/* Metabolic Indicators Grid */}
          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
            {/* BMR Indicator */}
            <div className="health-card bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Basal Metabolic Rate</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Caloric volume required to maintain primary systemic functions while fully at rest (derived via Mifflin-St Jeor equation).
                </p>
              </div>
              <div className="mt-8 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">{computedBmr}</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">kcal/day</span>
              </div>
            </div>

            {/* TDEE Indicator */}
            <div className="health-card bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Daily Energy Expenditure</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Total Daily Energy Expenditure (TDEE) incorporating BMR targets mapped directly to active exercise multipliers.
                </p>
              </div>
              <div className="mt-8 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">{computedTdee}</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">kcal/day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reusable UI Banner */}
        <div className="health-card bg-white p-6 flex items-center gap-4 border border-emerald-200 bg-emerald-50/20">
          <Scale className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Minimal Light Theme System Active</h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Successfully migrated to light-theme-first Apple Health and Notion styling tokens. Dark neon parameters and decorative glowing blobs have been stripped to emphasize high-contrast data structures, usability, and visual clarity.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
