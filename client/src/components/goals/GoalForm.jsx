import { useState } from 'react';
import { Target, Save, Sparkles, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const GoalForm = ({ currentGoals, onGoalsUpdated }) => {
  const { updateUser } = useAuthStore();
  const [calories, setCalories] = useState(currentGoals?.calories || 2000);
  const [protein, setProtein] = useState(currentGoals?.protein || 130);
  const [carbohydrate, setCarbohydrate] = useState(currentGoals?.carbohydrate || 220);
  const [fat, setFat] = useState(currentGoals?.fat || 70);
  const [fiber, setFiber] = useState(currentGoals?.fiber || 30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const goalsData = {
        calories: Number(calories),
        protein: Number(protein),
        carbohydrate: Number(carbohydrate),
        fat: Number(fat),
        fiber: Number(fiber),
      };

      const { data } = await api.put('/me/goals', goalsData);
      updateUser(data.data);
      if (onGoalsUpdated) {
        onGoalsUpdated(data.data.goals);
      }
      toast.success('Daily nutrition goals updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update nutrition goals');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="health-card bg-white p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Custom Nutrition Goals</h3>
          <p className="text-slate-500 text-xs">Set daily targets to track your nutrition progress</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Calories (kcal)
            </label>
            <input
              type="number"
              required
              min="500"
              max="10000"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="health-input font-medium"
              placeholder="2000"
            />
            <p className="text-[10px] text-slate-400">Allowed: 500 - 10,000</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Protein (g)
            </label>
            <input
              type="number"
              required
              min="0"
              max="500"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="health-input font-medium"
              placeholder="130"
            />
            <p className="text-[10px] text-slate-400">Allowed: 0 - 500</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              required
              min="0"
              max="1000"
              value={carbohydrate}
              onChange={(e) => setCarbohydrate(e.target.value)}
              className="health-input font-medium"
              placeholder="220"
            />
            <p className="text-[10px] text-slate-400">Allowed: 0 - 1000</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Fat (g)
            </label>
            <input
              type="number"
              required
              min="0"
              max="300"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="health-input font-medium"
              placeholder="70"
            />
            <p className="text-[10px] text-slate-400">Allowed: 0 - 300</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Fiber (g)
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              className="health-input font-medium"
              placeholder="30"
            />
            <p className="text-[10px] text-slate-400">Allowed: 0 - 100</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving Goals...' : 'Save Goals'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;
