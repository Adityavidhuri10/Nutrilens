import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Camera, Brain, Activity, ShieldCheck, ArrowRight, Heart, Sparkles, Clock } from 'lucide-react';

const LandingPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#475569]">
      {/* Apple-style clean header */}
      <header className="px-6 lg:px-16 h-16 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm">
            NL
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-heading">
            NutriLens<span className="text-emerald-500">AI</span>
          </span>
        </div>
        <nav className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white shadow-sm active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Simple Trust-building Hero Section */}
        <section className="px-6 lg:px-16 pt-20 pb-20 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide mb-6">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Simple Nutrition Intelligence for Modern Health
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Track your meals using <br className="hidden sm:block" />
            <span className="text-emerald-500">computer vision</span>.
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap a photo of your plate to instantly analyze ingredients, estimate portion sizes, and calculate micro/macro nutrients. No tedious typing required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-white shadow-sm flex items-center justify-center gap-2 group transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Clean, Non-Glow Feature Grid */}
        <section className="px-6 lg:px-16 py-20 bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Nutrition tracking designed to be effortless
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Skip the complicated calorie lookup databases. Get instant estimates based on standard clinical guidelines.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="health-card p-8 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Photo Recognition</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Identify main food items and estimate quantities directly from food images using AI analysis.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="health-card p-8 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Nutrition Coaching</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Daily feedback suggestions generated based on physical parameters, BMR, and logged calorie limits.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="health-card p-8 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Macro Ratios</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Accurate ratios of protein, fats, carbohydrates, and fiber mapped to keep your diet on target.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="health-card p-8 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Privacy & Security</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Strict authorization mechanisms and encrypted JWT standards protect your profile details.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Apple-style clean trust statements */}
        <section className="px-6 lg:px-16 py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Accuracy</h4>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Utilizes established Mifflin-St Jeor metabolic formulas and robust USDA/IFCT food estimation guidelines.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600">
                <Clock className="w-5 h-5" />
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Logging Speed</h4>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Assisted image uploading cuts standard food tracking workflows from 2 minutes down to under 15 seconds.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600">
                <Heart className="w-5 h-5" />
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Health Focus</h4>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                A complete physical wellness assistant focusing on balanced long-term goals instead of unhealthy caloric crashes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} NutriLens AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
