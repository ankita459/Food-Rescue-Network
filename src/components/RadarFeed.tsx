import React, { useState } from 'react';
import {
  Radio,
  Search,
  SlidersHorizontal,
  Flame,
  CheckCircle,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { SurplusListing } from '../types';
import { ListingCard } from './ListingCard';

interface RadarFeedProps {
  listings: SurplusListing[];
  currentTime: number;
  onOpenSafetyModal: (listing: SurplusListing) => void;
  onOpenClaimModal: (listing: SurplusListing) => void;
  onOpenQRModal: (listing: SurplusListing) => void;
  onOpenVerificationModal: (listing: SurplusListing) => void;
  onUpdateStatus: (listingId: string, nextStatus: 'available' | 'claimed' | 'completed') => void;
  isAccessibilityMode?: boolean;
}

export const RadarFeed: React.FC<RadarFeedProps> = ({
  listings,
  currentTime,
  onOpenSafetyModal,
  onOpenClaimModal,
  onOpenQRModal,
  onOpenVerificationModal,
  onUpdateStatus,
  isAccessibilityMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'claimed' | 'completed'>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'Veg' | 'Vegan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab counts
  const availableCount = listings.filter((l) => l.status === 'available').length;
  const claimedCount = listings.filter((l) => l.status === 'claimed').length;
  const completedCount = listings.filter((l) => l.status === 'completed').length;

  // Filter listings based on active filters
  const filtered = listings.filter((item) => {
    // Tab filter
    if (activeTab === 'available' && item.status !== 'available') return false;
    if (activeTab === 'claimed' && item.status !== 'claimed') return false;
    if (activeTab === 'completed' && item.status !== 'completed') return false;

    // Dietary filter
    if (dietaryFilter !== 'all' && item.dietaryType !== dietaryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFood = item.foodItem.toLowerCase().includes(q);
      const matchProvider = item.providerName.toLowerCase().includes(q);
      const matchLocation = item.providerLocation.toLowerCase().includes(q);
      if (!matchFood && !matchProvider && !matchLocation) return false;
    }

    return true;
  });

  // Sort by urgency: shortest remaining time first (or critical first)
  const sortedListings = [...filtered].sort((a, b) => {
    // Completed items go to the bottom unless viewing completed tab
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;

    // Sort by earliest expiresAt first (most urgent)
    return a.expiresAt - b.expiresAt;
  });

  const urgentCount = listings.filter(
    (l) => l.status === 'available' && (l.expiresAt - currentTime) / 1000 / 60 < 20
  ).length;

  return (
    <div className="bg-slate-850/70 border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col h-full">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Live Rescue Radar Feed
              {urgentCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-rose-400" />
                  {urgentCount} High Urgency
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Sorted by urgency priority & safe transit window
            </p>
          </div>
        </div>

        {/* Dietary Quick Filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/70 text-xs">
          {(['all', 'Veg', 'Vegan'] as const).map((diet) => (
            <button
              key={diet}
              onClick={() => setDietaryFilter(diet)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                dietaryFilter === diet
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diet === 'all' ? 'All Diets' : diet}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="space-y-3 mb-4">
        {/* State Transition Filter Tabs */}
        <div className={`grid grid-cols-4 gap-1.5 p-1.5 rounded-xl border text-xs ${
          isAccessibilityMode
            ? 'bg-black border-2 border-slate-500'
            : 'bg-slate-900/80 border-slate-700/70'
        }`}>
          <button
            id="tab-filter-all"
            onClick={() => setActiveTab('all')}
            className={`px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isAccessibilityMode
                ? activeTab === 'all'
                  ? 'min-h-[44px] bg-white text-black border-2 border-white'
                  : 'min-h-[44px] bg-black text-white border-2 border-slate-600 hover:border-white'
                : activeTab === 'all'
                ? 'py-1.5 bg-slate-800 text-white shadow-sm'
                : 'py-1.5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isAccessibilityMode && activeTab === 'all'
                ? 'bg-black text-white font-bold'
                : 'bg-slate-700/60'
            }`}>
              {listings.length}
            </span>
          </button>

          <button
            id="tab-filter-available"
            onClick={() => setActiveTab('available')}
            className={`px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isAccessibilityMode
                ? activeTab === 'available'
                  ? 'min-h-[44px] bg-sky-400 text-black border-2 border-sky-300'
                  : 'min-h-[44px] bg-black text-sky-300 border-2 border-slate-600 hover:border-sky-400'
                : activeTab === 'available'
                ? 'py-1.5 bg-sky-950/80 text-sky-300 border border-sky-600/40 shadow-sm'
                : 'py-1.5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Available</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isAccessibilityMode && activeTab === 'available'
                ? 'bg-black text-sky-300 font-bold'
                : 'bg-sky-900/60 text-sky-300'
            }`}>
              {availableCount}
            </span>
          </button>

          <button
            id="tab-filter-claimed"
            onClick={() => setActiveTab('claimed')}
            className={`px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isAccessibilityMode
                ? activeTab === 'claimed'
                  ? 'min-h-[44px] bg-emerald-400 text-black border-2 border-emerald-300'
                  : 'min-h-[44px] bg-black text-emerald-300 border-2 border-slate-600 hover:border-emerald-400'
                : activeTab === 'claimed'
                ? 'py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 shadow-sm'
                : 'py-1.5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Claimed / Active</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isAccessibilityMode && activeTab === 'claimed'
                ? 'bg-black text-emerald-300 font-bold'
                : 'bg-emerald-900/60 text-emerald-300'
            }`}>
              {claimedCount}
            </span>
          </button>

          <button
            id="tab-filter-completed"
            onClick={() => setActiveTab('completed')}
            className={`px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isAccessibilityMode
                ? activeTab === 'completed'
                  ? 'min-h-[44px] bg-white text-black border-2 border-white'
                  : 'min-h-[44px] bg-black text-slate-300 border-2 border-slate-600 hover:border-white'
                : activeTab === 'completed'
                ? 'py-1.5 bg-slate-800 text-emerald-400 shadow-sm'
                : 'py-1.5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Completed</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isAccessibilityMode && activeTab === 'completed'
                ? 'bg-black text-white font-bold'
                : 'bg-slate-700/60'
            }`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by food name, hotel/caterer or pickup landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cards List or Empty State */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {sortedListings.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">
              No matching surplus items found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try switching tabs or clear search filters to view active regional food batches.
            </p>
          </div>
        ) : (
          sortedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currentTime={currentTime}
              onOpenSafetyModal={onOpenSafetyModal}
              onOpenClaimModal={onOpenClaimModal}
              onOpenQRModal={onOpenQRModal}
              onOpenVerificationModal={onOpenVerificationModal}
              onUpdateStatus={onUpdateStatus}
              isAccessibilityMode={isAccessibilityMode}
            />
          ))
        )}
      </div>
    </div>
  );
};
