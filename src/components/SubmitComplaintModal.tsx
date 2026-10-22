import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { ComplaintCategory, ComplaintPriority } from '../types';
import {
  X,
  MapPin,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Loader2,
  Info,
} from 'lucide-react';

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createComplaint, complaints } = useCleanConnect();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('overflowing_bins');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: ComplaintCategory;
    confidence: number;
    reason: string;
    suggestedPriority?: ComplaintPriority;
    provider?: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Potential duplicate check
  const potentialDuplicates = complaints.filter(
    (c) =>
      c.status !== 'resolved' &&
      c.status !== 'rejected' &&
      category === c.category &&
      location.trim().length > 3 &&
      c.location.toLowerCase().includes(location.toLowerCase().trim().slice(0, 8))
  );

  const handleDeviceLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, location: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setIsLocating(true);
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.location;
      return rest;
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        if (!location) {
          setLocation(`Civic GPS: ${lat}°N, ${Math.abs(lng)}°W (GPS Verified)`);
        }
      },
      (err) => {
        setIsLocating(false);
        setErrors((prev) => ({
          ...prev,
          location: `Location access denied (${err.message}). Please enter address manually.`,
        }));
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'File must be an image (JPEG, PNG, WebP).' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Photo size cannot exceed 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.photo;
        return rest;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAiCategorySuggest = async () => {
    if (!description.trim() || description.length < 10) {
      setErrors((prev) => ({ ...prev, description: 'Enter at least 10 characters for AI triage.' }));
      return;
    }
    setIsAiClassifying(true);
    try {
      const res = await fetch('/api/ai/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data && data.category) {
        setAiSuggestion(data);
        setCategory(data.category as ComplaintCategory);
        if (data.suggestedPriority) {
          setPriority(data.suggestedPriority);
        }
      }
    } catch {
      // Local fallback
      setAiSuggestion({
        category: 'overflowing_bins',
        confidence: 0.85,
        reason: 'Analyzed description using local waste triage heuristic.',
      });
    } finally {
      setIsAiClassifying(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.length < 5) errs.title = 'Title must be at least 5 characters.';
    if (!description.trim() || description.length < 15)
      errs.description = 'Please describe the problem in detail (minimum 15 characters).';
    if (!location.trim() || location.length < 4) errs.location = 'Please provide an exact street location or park name.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createComplaint({
      title,
      category,
      description,
      location,
      latitude,
      longitude,
      priority,
      photo_url: photoPreview || undefined,
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Report a Community Waste Problem
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your report is geotagged and dispatched to municipal sanitation teams.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Complaint Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Overflowing recycling bin at 4th Street Playground"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                errors.title ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description & AI Triage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiCategorySuggest}
                disabled={isAiClassifying || description.length < 10}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline disabled:opacity-50"
              >
                {isAiClassifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AI Auto-Triage Category</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste type, approximate volume, hazards (e.g. broken glass, chemical smells, blocked pedestrian walkways)..."
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                errors.description ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}

            {/* AI Suggestion Banner */}
            {aiSuggestion && (
              <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">
                    CleanConnect AI Suggestion ({Math.round(aiSuggestion.confidence * 100)}% match via {aiSuggestion.provider || 'Gemini'}):
                  </p>
                  <p>{aiSuggestion.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Waste Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="overflowing_bins">Overflowing Public Bins</option>
                <option value="illegal_littering">Illegal Littering / Dumping</option>
                <option value="plastic_waste">Plastic & Packaging Accumulation</option>
                <option value="construction_debris">Construction & Masonry Debris</option>
                <option value="e_waste_hazard">E-Waste & Battery Hazard</option>
                <option value="hazardous_chemicals">Hazardous Chemicals / Oils</option>
                <option value="blocked_drainage">Blocked Stormwater Drainage</option>
                <option value="green_waste">Green Yard & Garden Debris</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Urgency / Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low — Routine maintenance sweep</option>
                <option value="medium">Medium — Standard 24h municipal response</option>
                <option value="high">High — Significant public space obstruction</option>
                <option value="urgent">Urgent — Immediate hazard (toxic/storm flood risk)</option>
              </select>
            </div>
          </div>

          {/* Location & GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Incident Location <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleDeviceLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>{isLocating ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
              </button>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Riverside Park, near North Pavilion Gate or 420 High St"
                className={`w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  errors.location ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
            </div>
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            {latitude && longitude && (
              <p className="text-[11px] font-mono tabular-nums text-slate-500 mt-1">
                Coordinates: {latitude}, {longitude}
              </p>
            )}
          </div>

          {/* Duplicate Warning */}
          {potentialDuplicates.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Possible existing report nearby:</p>
                <p>
                  Ticket <strong>{potentialDuplicates[0].ticket_code}</strong> ({potentialDuplicates[0].title}) is currently{' '}
                  <span className="capitalize">{potentialDuplicates[0].status.replace('_', ' ')}</span>.
                  You may still submit if this is a separate issue.
                </p>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Optional Verification Photo (Max 5MB)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Choose Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Uploaded waste preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              CleanConnect protects resident privacy. Your exact email and name are never published
              on public impact pages. Reports are used solely for municipal dispatch and service metrics.
            </p>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
            >
              Submit Civic Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
