import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { User, Key, ArrowLeft, Loader2, Save, UserCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile fields state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dietaryPreference, setDietaryPreference] = useState('none');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/me');
        setProfileData(data.data);
        setName(data.data.name || '');
        setAge(data.data.profile?.age || '');
        setGender(data.data.profile?.gender || 'male');
        setHeight(data.data.profile?.height || '');
        setWeight(data.data.profile?.weight || '');
        setActivityLevel(data.data.profile?.activityLevel || 'moderate');
        setDietaryPreference(data.data.profile?.dietaryPreference || 'none');
        updateUser(data.data);
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const updateData = {
        name,
        profile: {
          age: Number(age),
          gender,
          height: Number(height),
          weight: Number(weight),
          activityLevel,
          dietaryPreference,
        },
      };

      const { data } = await api.put('/me', updateData);
      updateUser(data.data);
      setProfileData(data.data);
      toast.success('Physical profile details updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile details');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password parameters do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/me/password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading account modules...</span>
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
          <Link
            to="/meals"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-lg bg-white shadow-sm transition-colors"
          >
            My Meals
          </Link>
          <Link
            to="/meals/upload"
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:bg-emerald-600 border border-transparent px-2.5 py-1.5 rounded-lg bg-emerald-500 shadow-sm transition-colors"
          >
            Log Meal
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
          Profile Settings
        </span>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
            Personal Health Profile
          </h1>
          <p className="text-slate-500 text-sm">
            Maintain your exact physical stats to compute accurate BMR and metabolic targets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main profile details column */}
          <div className="md:col-span-2 space-y-8">
            <div className="health-card bg-white p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Physical Metrics</h3>
                  <p className="text-slate-500 text-xs">Update your height, weight, activity indices, and preferences</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="health-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profileData?.email || ''}
                      className="health-input bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Age</label>
                    <input
                      type="number"
                      required
                      min="13"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="health-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="health-input"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Diet Preference</label>
                    <select
                      value={dietaryPreference}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="health-input"
                    >
                      <option value="none">Standard</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto</option>
                      <option value="paleo">Paleo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Height (cm)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      max="300"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="health-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="20"
                      max="500"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="health-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="health-input"
                  >
                    <option value="sedentary">Sedentary (Little to no exercise)</option>
                    <option value="light">Lightly Active (1-3 days exercise/week)</option>
                    <option value="moderate">Moderately Active (3-5 days exercise/week)</option>
                    <option value="active">Active (6-7 days intense exercise/week)</option>
                    <option value="very_active">Very Active (Twice daily intense sports)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdatingProfile ? 'Updating Stats...' : 'Update Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar controls: change password */}
          <div className="space-y-8">
            <div className="health-card bg-white p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Security Setting</h3>
                  <p className="text-slate-400 text-[10px]">Alter login passwords</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="health-input py-1.5 text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="health-input py-1.5 text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="health-input py-1.5 text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 mt-4 py-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
