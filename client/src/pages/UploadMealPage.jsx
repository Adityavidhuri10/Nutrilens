import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Trash2, Calendar, FileText, Utensils, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const UploadMealPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Set default datetime to now
  useEffect(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:MM for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle file validation
  const validateAndSetFile = (file) => {
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }

    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    toast.success('Image loaded successfully');
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please upload or drag & drop a food image');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading and logging your meal...');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('mealType', mealType);
      formData.append('date', new Date(date).toISOString());
      formData.append('notes', notes);

      await api.post('/meals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Meal logged successfully!', { id: toastId });
      navigate('/meals');
    } catch (err) {
      toast.error(err.message || 'Failed to upload meal', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const mealTypes = [
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
          Upload System Active
        </span>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
            Log New Meal
          </h1>
          <p className="text-slate-500 text-sm">
            Drag & drop an image of your food and select the metadata to keep your food log accurate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Drag & Drop / Preview */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Food Photo
              </h3>
            </div>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`health-card bg-white border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[350px] ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 transition-transform group-hover:scale-105">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-slate-950 font-bold text-lg mb-2">
                  Drag and drop your food image here
                </h4>
                <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                  Support JPEG, PNG, and WebP formats up to 5MB. Photo should be clear and well-lit.
                </p>
                <button
                  type="button"
                  className="btn-secondary text-sm font-bold shadow-sm"
                >
                  Choose Local File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="health-card bg-white rounded-2xl overflow-hidden relative group min-h-[350px] flex flex-col justify-between border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ready for Upload
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1.5 rounded-lg border border-red-100/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
                  <img
                    src={imagePreview}
                    alt="Food upload preview"
                    className="max-h-[320px] max-w-full object-contain rounded-xl shadow-sm border border-slate-200/50"
                  />
                </div>
                <div className="p-4 border-t border-slate-100 bg-white text-center text-xs text-slate-400 font-medium">
                  {imageFile?.name} ({Math.round(imageFile?.size / 1024)} KB)
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata form details */}
          <div className="md:col-span-5 space-y-6">
            <div className="health-card bg-white p-6 md:p-8 space-y-6">
              {/* Meal Type Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                  Meal Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypes.map((type) => {
                    const isSelected = mealType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setMealType(type.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-bold transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 ring-1 ring-emerald-500/10'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{type.emoji}</span>
                          {type.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Logged At Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="health-input"
                />
              </div>

              {/* Meal Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  maxLength="500"
                  className="health-input resize-none py-3"
                  placeholder="Describe your meal (e.g., portion size, ingredients, restaurant name...)"
                ></textarea>
                <div className="flex justify-end text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {notes.length} / 500 chars
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary w-full py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading Meal...
                    </>
                  ) : (
                    'Upload & Log Meal'
                  )}
                </button>
                <Link
                  to="/dashboard"
                  className="btn-secondary w-full py-3 text-xs font-bold text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UploadMealPage;
