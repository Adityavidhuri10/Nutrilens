import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();

  // Multi-step form state (1: Credentials, 2: Profile Metrics)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in name, email, and password');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!age || !height || !weight || !gender || !activityLevel) {
      toast.error('Please fill in all physical profile fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        profile: {
          age: Number(age),
          gender,
          height: Number(height),
          weight: Number(weight),
          activityLevel,
        },
      });

      const { user, accessToken, refreshToken } = data.data;

      // Update auth state in Zustand store
      setAuth(user, accessToken, refreshToken);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Simple Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
              NL
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              NutriLens<span className="text-emerald-500">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-slate-500 text-sm mt-1">
            {step === 1 ? 'Step 1 of 2: Basic Account info' : 'Step 2 of 2: Health & Physical metrics'}
          </p>
        </div>

        {/* Clean, minimalist card layout */}
        <div className="health-card bg-white p-8">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="health-input"
                  placeholder="Ayush Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="health-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="health-input pr-10"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2 group"
              >
                Continue to Physical Stats
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    min="13"
                    max="120"
                    className="health-input"
                    placeholder="24"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    className="health-input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="300"
                    className="health-input"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="500"
                    className="health-input"
                    placeholder="72"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Activity Level</label>
                <select
                  className="health-input"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                >
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="light">Lightly Active (1-3 days exercise/week)</option>
                  <option value="moderate">Moderately Active (3-5 days exercise/week)</option>
                  <option value="active">Active (6-7 days intense exercise/week)</option>
                  <option value="very_active">Very Active (Twice daily intense sports)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 btn-secondary flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 btn-primary flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Submit Details'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <span className="text-slate-400 text-sm">Already have an account? </span>
            <Link to="/login" className="text-emerald-600 text-sm font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
