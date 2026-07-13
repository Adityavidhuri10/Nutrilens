import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, FileText, Utensils, X, Check, UploadCloud, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const MealsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [meals, setMeals] = useState([]);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'filtered'

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal edit states
  const [editingMeal, setEditingMeal] = useState(null);
  const [editMealType, setEditMealType] = useState('breakfast');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch all meals
  const fetchMeals = async () => {
    try {
      const { data } = await api.get('/meals?limit=100');
      setMeals(data.data);
    } catch (err) {
      toast.error('Failed to load meal history');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch meals by date range
  const fetchFilteredMeals = async (start, end) => {
    try {
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      const { data } = await api.get(`/meals/history?${params.toString()}`);
      setGroupedHistory(data.data);
      setViewMode('filtered');
    } catch (err) {
      toast.error('Failed to load filtered history');
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleApplyFilter = () => {
    if (startDate || endDate) {
      fetchFilteredMeals(startDate, endDate);
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setViewMode('all');
    setGroupedHistory([]);
  };

  const handleQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
    fetchFilteredMeals(startStr, endStr);
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (editImagePreview && editImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  // Open edit modal
  const handleOpenEdit = (meal) => {
    setEditingMeal(meal);
    setEditMealType(meal.mealType);

    // Format UTC Date string to YYYY-MM-DDTHH:MM local format
    const localDate = new Date(meal.date);
    const tzOffset = localDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(localDate.getTime() - tzOffset).toISOString().slice(0, 16);
    setEditDate(localISOTime);

    setEditNotes(meal.notes || '');
    setEditImageFile(null);
    setEditImagePreview(meal.image.url);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingMeal(null);
    if (editImagePreview && editImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview('');
    setEditImageFile(null);
  };

  // Handle edit image drop/select
  const validateAndSetEditFile = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }

    setEditImageFile(file);
    if (editImagePreview && editImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview(URL.createObjectURL(file));
    toast.success('New image selected');
  };

  const handleEditDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleEditDragLeave = () => {
    setIsDragging(false);
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetEditFile(e.dataTransfer.files[0]);
    }
  };

  const handleEditFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetEditFile(e.target.files[0]);
    }
  };

  // Handle delete
  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal log? This action is permanent.')) {
      return;
    }

    const toastId = toast.loading('Deleting meal log...');
    try {
      await api.delete(`/meals/${mealId}`);
      toast.success('Meal log deleted successfully', { id: toastId });
      fetchMeals();
      if (viewMode === 'filtered') {
        fetchFilteredMeals(startDate, endDate);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete meal log', { id: toastId });
    }
  };

  // Handle update submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const toastId = toast.loading('Updating meal details...');

    try {
      const formData = new FormData();
      if (editImageFile) {
        formData.append('image', editImageFile);
      }
      formData.append('mealType', editMealType);
      formData.append('date', new Date(editDate).toISOString());
      formData.append('notes', editNotes);

      const { data } = await api.put(`/meals/${editingMeal._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Meal log updated successfully', { id: toastId });
      fetchMeals();
      if (viewMode === 'filtered') {
        fetchFilteredMeals(startDate, endDate);
      }
      handleCloseEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to update meal log', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const getMealTypeEmoji = (type) => {
    switch (type) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🥗';
      case 'dinner': return '🍛';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading meal logs...</span>
        </div>
      </div>
    );
  }

  const mealTypesList = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { id: 'lunch', label: 'Lunch', emoji: '🥗' },
    { id: 'dinner', label: 'Dinner', emoji: '🍛' },
    { id: 'snack', label: 'Snack', emoji: '🍎' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#475569] flex flex-col">
      {/* Premium Apple/Notion Header */}
      <header className="px-6 lg:px-16 h-16 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm">
              NL
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              NutriLens<span className="text-emerald-500">AI</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
              My Meals History
            </h1>
            <p className="text-slate-500 text-sm">
              Track, browse, update, and manage your logged food images and details
            </p>
          </div>
          <span className="badge-active">
            <Check className="w-3.5 h-3.5" />
            Total: {viewMode === 'filtered'
              ? groupedHistory.reduce((acc, day) => acc + day.meals.length, 0)
              : meals.length} {(viewMode === 'filtered'
                ? groupedHistory.reduce((acc, day) => acc + day.meals.length, 0)
                : meals.length) === 1 ? 'Meal' : 'Meals'}
          </span>
        </div>

        {/* Date Range Filter */}
        <div className="health-card bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            Filter by Date
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="health-input py-1.5 px-2.5 text-xs w-auto"
              placeholder="Start"
            />
            <span className="text-slate-400 text-xs font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="health-input py-1.5 px-2.5 text-xs w-auto"
              placeholder="End"
            />
            <button
              onClick={handleApplyFilter}
              disabled={!startDate && !endDate}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-40"
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Apply
            </button>
            {viewMode === 'filtered' && (
              <button
                onClick={handleClearFilter}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Grouped History View (when filtered) */}
        {viewMode === 'filtered' && groupedHistory.length > 0 && (
          <div className="space-y-6">
            {groupedHistory.map((dayGroup) => (
              <div key={dayGroup.date} className="space-y-3">
                {/* Day Header with Totals */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                  <h3 className="font-bold text-slate-900 text-sm">
                    📅 {new Date(dayGroup.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="text-slate-400 font-semibold ml-2">
                      ({dayGroup.meals.length} {dayGroup.meals.length === 1 ? 'meal' : 'meals'})
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-100">
                      {dayGroup.totals.calories} kcal
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                      {dayGroup.totals.protein}g P
                    </span>
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-100">
                      {dayGroup.totals.carbs}g C
                    </span>
                    <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-100">
                      {dayGroup.totals.fats}g F
                    </span>
                  </div>
                </div>
                {/* Meal Cards for This Day */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dayGroup.meals.map((meal) => (
                    <div key={meal._id} className="health-card bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col">
                      <div className="relative h-36 bg-slate-100 overflow-hidden border-b border-slate-100">
                        <img
                          src={meal.image.url}
                          alt={`${meal.mealType} log`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm shadow-sm py-0.5 px-2 rounded-lg border border-slate-100/50 text-[10px] font-bold text-slate-900 capitalize">
                          {getMealTypeEmoji(meal.mealType)} {meal.mealType}
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {meal.nutrition?.foodItems?.length > 0 && (
                          <p className="text-slate-600 text-xs truncate">{meal.nutrition.foodItems.join(', ')}</p>
                        )}
                        {meal.nutrition && meal.nutrition.analysisStatus !== 'failed' && (
                          <div className="flex gap-2 text-[10px] font-bold">
                            <span className="text-emerald-600">{meal.nutrition.calories}kcal</span>
                            <span className="text-blue-600">{meal.nutrition.protein}g P</span>
                            <span className="text-amber-600">{meal.nutrition.carbs}g C</span>
                            <span className="text-rose-600">{meal.nutrition.fats}g F</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'filtered' && groupedHistory.length === 0 && (
          <div className="health-card bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 font-bold text-lg mb-2">No meals in this range</h3>
            <p className="text-slate-500 text-sm">Try a different date range or clear the filter.</p>
          </div>
        )}

        {/* All Meals View (default) */}
        {viewMode === 'all' && meals.length === 0 ? (
          <div className="health-card bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-6">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-2">No meals logged yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
              Start logging your food entries by uploading clear pictures of your breakfast, lunch, dinner, or snacks!
            </p>
            <Link
              to="/meals/upload"
              className="btn-primary flex items-center gap-2 text-sm font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log Your First Meal
            </Link>
          </div>
        ) : viewMode === 'all' && (
          /* Cards Grid */
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div key={meal._id} className="health-card bg-white rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between">
                {/* Meal Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  <img
                    src={meal.image.url}
                    alt={`${meal.mealType} log`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-sm py-1 px-2.5 rounded-lg border border-slate-100/50 flex items-center gap-1.5 text-xs font-bold text-slate-900 capitalize">
                    <span>{getMealTypeEmoji(meal.mealType)}</span>
                    {meal.mealType}
                  </div>
                  {/* AI Analysis Status Badge */}
                  <div className={`absolute top-3 right-3 py-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm shadow-sm border ${meal.nutrition?.analysisStatus === 'success'
                      ? 'bg-emerald-50/95 text-emerald-700 border-emerald-200/60'
                      : meal.nutrition?.analysisStatus === 'partial'
                        ? 'bg-amber-50/95 text-amber-700 border-amber-200/60'
                        : 'bg-red-50/95 text-red-600 border-red-200/60'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meal.nutrition?.analysisStatus === 'success'
                        ? 'bg-emerald-500'
                        : meal.nutrition?.analysisStatus === 'partial'
                          ? 'bg-amber-500'
                          : 'bg-red-400'
                      }`}></span>
                    {meal.nutrition?.analysisStatus === 'success' ? 'AI Analyzed' : meal.nutrition?.analysisStatus === 'partial' ? 'Partial' : 'No AI Data'}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(meal.date)}
                    </div>

                    {/* Nutrition Data */}
                    {meal.nutrition && meal.nutrition.analysisStatus !== 'failed' && (
                      <div className="space-y-3">
                        {/* Food Items Chips */}
                        {meal.nutrition.foodItems && meal.nutrition.foodItems.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {meal.nutrition.foodItems.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100/60"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Macro Bars */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calories</span>
                            <span className="text-xs font-extrabold text-slate-900">{meal.nutrition.calories}<span className="text-[9px] text-slate-400 ml-0.5">kcal</span></span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Protein</span>
                            <span className="text-xs font-extrabold text-slate-900">{meal.nutrition.protein}<span className="text-[9px] text-slate-400 ml-0.5">g</span></span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Carbs</span>
                            <span className="text-xs font-extrabold text-slate-900">{meal.nutrition.carbs}<span className="text-[9px] text-slate-400 ml-0.5">g</span></span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Fats</span>
                            <span className="text-xs font-extrabold text-slate-900">{meal.nutrition.fats}<span className="text-[9px] text-slate-400 ml-0.5">g</span></span>
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Fiber</span>
                            <span className="text-xs font-extrabold text-slate-900">{meal.nutrition.fiber}<span className="text-[9px] text-slate-400 ml-0.5">g</span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fallback when AI analysis failed */}
                    {(!meal.nutrition || meal.nutrition.analysisStatus === 'failed') && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI analysis unavailable</span>
                      </div>
                    )}

                    {meal.notes ? (
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                        {meal.notes}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        No additional notes added.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(meal)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal._id)}
                      className="flex items-center justify-center p-2 border border-red-100 rounded-lg text-red-600 bg-red-50 hover:bg-red-100/80 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal Dialog */}
      {editingMeal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-100 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" />
                Modify Meal Entry
              </h2>
              <button
                onClick={handleCloseEdit}
                className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <form onSubmit={handleUpdateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Update Food Photo (Optional)
                </label>
                <div
                  onDragOver={handleEditDragOver}
                  onDragLeave={handleEditDragLeave}
                  onDrop={handleEditDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors relative min-h-[160px] flex flex-col items-center justify-center ${isDragging
                      ? 'border-emerald-500 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <img
                    src={editImagePreview}
                    alt="Current or preview upload"
                    className="max-h-[140px] max-w-full object-contain rounded-lg shadow-xs"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white rounded-lg transition-opacity gap-1.5 p-4">
                    <UploadCloud className="w-6 h-6" />
                    <span className="text-xs font-bold">Replace Photo</span>
                    <span className="text-[9px] text-slate-300">Drag/drop or click (JPEG, PNG, WebP)</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleEditFileSelect}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Meal Type selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Meal Classification
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypesList.map((type) => {
                    const isSelected = editMealType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEditMealType(type.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${isSelected
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                      >
                        <span className="text-base mb-1">{type.emoji}</span>
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logged date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Logged At Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="health-input"
                />
              </div>

              {/* Meal notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Meal Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows="3"
                  maxLength="500"
                  className="health-input resize-none py-2"
                  placeholder="Describe portion sizes, ingredients, etc..."
                ></textarea>
                <div className="flex justify-end text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {editNotes.length} / 500 chars
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isUpdating}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary py-2 px-5 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsPage;
