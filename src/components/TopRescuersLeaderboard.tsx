import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Zap,
  Anchor,
  Leaf,
  Heart,
  Flame,
  CheckCircle2,
  X,
  Sparkles,
  Users,
  Search,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, BadgeId, SurplusListing } from '../types';
import { AVAILABLE_BADGES } from '../lib/gamification';

interface TopRescuersLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  rescuers: UserProfile[];
  currentUserProfile: {
    uid: string;
    displayName: string;
    photoURL?: string;
    rescuesCount: number;
    totalKgRescued: number;
    mealsSaved: number;
    fastestClaimMinutes: number;
    earnedBadges: BadgeId[];
  };
  onCheerVolunteer: (uid: string) => void;
  isAccessibilityMode?: boolean;
}

type SortMetric = 'rescues' | 'weight' | 'meals';

export const TopRescuersLeaderboard: React.FC<TopRescuersLeaderboardProps> = ({
  isOpen,
  onClose,
  rescuers,
  currentUserProfile,
  onCheerVolunteer,
  isAccessibilityMode = false,
}) => {
  const [activeMetric, setActiveMetric] = useState<SortMetric>('rescues');
  const [searchQuery, setSearchQuery] = useState('');
  const [cheeredUids, setCheeredUids] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Merge current user into rescuers list if not already present or update their stats
  const allRescuersMap = new Map<string, UserProfile>();
  rescuers.forEach((r) => allRescuersMap.set(r.uid, r));

  if (currentUserProfile.uid) {
    const existing = allRescuersMap.get(currentUserProfile.uid);
    allRescuersMap.set(currentUserProfile.uid, {
      uid: currentUserProfile.uid,
      displayName: currentUserProfile.displayName || 'You (Active Volunteer)',
      photoURL: currentUserProfile.photoURL,
      rescuesCount: Math.max(existing?.rescuesCount || 0, currentUserProfile.rescuesCount),
      totalKgRescued: Math.max(existing?.totalKgRescued || 0, currentUserProfile.totalKgRescued),
      mealsSaved: Math.max(existing?.mealsSaved || 0, currentUserProfile.mealsSaved),
      fastestClaimMinutes: currentUserProfile.fastestClaimMinutes || existing?.fastestClaimMinutes || 10,
      earnedBadges: Array.from(new Set([...(existing?.earnedBadges || []), ...currentUserProfile.earnedBadges])),
      createdAt: existing?.createdAt || Date.now(),
      cheersCount: existing?.cheersCount || 0,
    });
  }

  // Sort based on active metric
  const sortedRescuers = Array.from(allRescuersMap.values()).sort((a, b) => {
    if (activeMetric === 'weight') return (b.totalKgRescued || 0) - (a.totalKgRescued || 0);
    if (activeMetric === 'meals') return (b.mealsSaved || 0) - (a.mealsSaved || 0);
    return (b.rescuesCount || 0) - (a.rescuesCount || 0);
  });

  // Filter by search
  const filteredRescuers = sortedRescuers.filter((r) =>
    r.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User rank in overall list
  const userRankIndex = sortedRescuers.findIndex((r) => r.uid === currentUserProfile.uid);
  const currentUserRank = userRankIndex !== -1 ? userRankIndex + 1 : sortedRescuers.length;

  const handleCheer = (uid: string) => {
    if (cheeredUids[uid]) return;
    setCheeredUids((prev) => ({ ...prev, [uid]: true }));
    onCheerVolunteer(uid);
  };

  const renderBadgeIcon = (id: BadgeId, sizeClass = 'w-3.5 h-3.5') => {
    switch (id) {
      case 'first-rescue':
        return <Award className={`${sizeClass} text-amber-400`} />;
      case 'speed-demon':
        return <Zap className={`${sizeClass} text-rose-400`} />;
      case 'community-anchor':
        return <Anchor className={`${sizeClass} text-sky-400`} />;
      case 'zero-waste-hero':
        return <Leaf className={`${sizeClass} text-emerald-400`} />;
      default:
        return <Medal className={`${sizeClass} text-amber-400`} />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center font-black text-xs text-slate-950 shadow-md shadow-amber-500/20 border border-amber-200">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center font-black text-xs text-slate-950 shadow-md shadow-slate-400/20 border border-slate-200">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center font-black text-xs text-amber-100 shadow-md shadow-amber-900/20 border border-amber-600">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
        #{rank}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all ${
          isAccessibilityMode
            ? 'bg-black border-4 border-amber-400 text-white'
            : 'bg-slate-900 border border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isAccessibilityMode
              ? 'bg-black border-amber-400'
              : 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                isAccessibilityMode
                  ? 'bg-amber-400 text-black font-black'
                  : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="leaderboard-modal-title"
                  className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5"
                >
                  Top Rescuers Leaderboard
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firebase Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Civic food rescue champions ranked by verified shelter deliveries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close leaderboard"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isAccessibilityMode
                ? 'min-h-[44px] min-w-[44px] bg-black text-amber-400 hover:bg-amber-400 hover:text-black border border-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Snapshot Strip */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
            isAccessibilityMode
              ? 'bg-zinc-950 border-amber-400 text-white'
              : 'bg-emerald-950/30 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center font-bold text-xs">
              {getRankBadge(currentUserRank)}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUserProfile.displayName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Your Profile
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>
                  <strong className="text-emerald-300 font-semibold">{currentUserProfile.rescuesCount}</strong> rescues
                </span>
                <span>•</span>
                <span>
                  <strong className="text-teal-300 font-semibold">{currentUserProfile.totalKgRescued}kg</strong> saved
                </span>
                <span>•</span>
                <span>
                  <strong className="text-amber-300 font-semibold">{currentUserProfile.mealsSaved}</strong> meals
                </span>
              </div>
            </div>
          </div>

          {/* Earned Badges Mini-Pills */}
          <div className="flex items-center gap-1.5">
            {currentUserProfile.earnedBadges.length > 0 ? (
              currentUserProfile.earnedBadges.map((badgeId) => {
                const b = AVAILABLE_BADGES.find((x) => x.id === badgeId);
                return (
                  <span
                    key={badgeId}
                    title={`${b?.name}: ${b?.description}`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isAccessibilityMode
                        ? 'bg-black text-amber-300 border-amber-400'
                        : `${b?.colorScheme.bg} ${b?.colorScheme.text} ${b?.colorScheme.border}`
                    }`}
                  >
                    {renderBadgeIcon(badgeId, 'w-3 h-3')}
                    <span>{b?.name}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                Complete 1 rescue to unlock 'First Rescue'!
              </span>
            )}
          </div>
        </div>

        {/* Controls: Metric Tabs & Search */}
        <div className="p-4 sm:px-5 pb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800/80">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Leaderboard ranking criteria"
            className={`flex items-center p-1 rounded-xl ${
              isAccessibilityMode ? 'bg-zinc-950 border border-amber-400' : 'bg-slate-950/80 border border-slate-800'
            }`}
          >
            <button
              role="tab"
              aria-selected={activeMetric === 'rescues'}
              onClick={() => setActiveMetric('rescues')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isAccessibilityMode
                  ? activeMetric === 'rescues'
                    ? 'bg-amber-400 text-black'
                    : 'text-white hover:text-amber-300'
                  : activeMetric === 'rescues'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Most Rescues
            </button>
            <button
              role="tab"
              aria-selected={activeMetric === 'weight'}
              onClick={() => setActiveMetric('weight')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isAccessibilityMode
                  ? activeMetric === 'weight'
                    ? 'bg-amber-400 text-black'
                    : 'text-white hover:text-amber-300'
                  : activeMetric === 'weight'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Surplus (kg)
            </button>
            <button
              role="tab"
              aria-selected={activeMetric === 'meals'}
              onClick={() => setActiveMetric('meals')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isAccessibilityMode
                  ? activeMetric === 'meals'
                    ? 'bg-amber-400 text-black'
                    : 'text-white hover:text-amber-300'
                  : activeMetric === 'meals'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meals Served
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search volunteer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none transition-colors ${
                isAccessibilityMode
                  ? 'bg-black border-2 border-amber-400 text-white placeholder-slate-400'
                  : 'bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Rescuers Ranked List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-2.5 divide-y divide-slate-800/40">
          {filteredRescuers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No volunteers matched "{searchQuery}".
            </div>
          ) : (
            filteredRescuers.map((rescuer, idx) => {
              const rank = idx + 1;
              const isCurrentUser = rescuer.uid === currentUserProfile.uid;
              const hasCheered = cheeredUids[rescuer.uid];

              return (
                <div
                  key={rescuer.uid}
                  className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${
                    isCurrentUser
                      ? isAccessibilityMode
                        ? 'bg-zinc-900 border-2 border-amber-400'
                        : 'bg-emerald-950/40 border border-emerald-500/40'
                      : isAccessibilityMode
                      ? 'bg-black border border-slate-800'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank & Avatar & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{getRankBadge(rank)}</div>

                    {rescuer.photoURL ? (
                      <img
                        src={rescuer.photoURL}
                        alt={rescuer.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs border border-slate-700 shrink-0">
                        {rescuer.displayName ? rescuer.displayName[0].toUpperCase() : 'V'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {rescuer.displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Earned Badge Badges */}
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {rescuer.earnedBadges && rescuer.earnedBadges.length > 0 ? (
                          rescuer.earnedBadges.map((bId) => {
                            const badge = AVAILABLE_BADGES.find((b) => b.id === bId);
                            return (
                              <span
                                key={bId}
                                title={badge?.name}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                  badge?.colorScheme.bg || 'bg-slate-800'
                                } ${badge?.colorScheme.text || 'text-slate-300'} ${
                                  badge?.colorScheme.border || 'border-slate-700'
                                }`}
                              >
                                {renderBadgeIcon(bId, 'w-2.5 h-2.5')}
                                <span className="hidden sm:inline">{badge?.name}</span>
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-500">Active Volunteer</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Social Cheer */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-black font-mono text-white">
                        {activeMetric === 'weight'
                          ? `${rescuer.totalKgRescued || 0}kg`
                          : activeMetric === 'meals'
                          ? `${rescuer.mealsSaved || 0} meals`
                          : `${rescuer.rescuesCount || 0} rescues`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {activeMetric === 'rescues'
                          ? `${rescuer.totalKgRescued || 0}kg diverted`
                          : `${rescuer.rescuesCount || 0} completed`}
                      </div>
                    </div>

                    {/* Social Cheer Action */}
                    <button
                      onClick={() => handleCheer(rescuer.uid)}
                      disabled={hasCheered}
                      title="Cheer this volunteer on Firebase"
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        hasCheered
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default'
                          : isAccessibilityMode
                          ? 'min-h-[44px] bg-black text-amber-400 hover:bg-amber-400 hover:text-black border border-amber-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-rose-400 hover:border-rose-500/30'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          hasCheered ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="font-mono text-[11px]">
                        {(rescuer.cheersCount || 0) + (hasCheered ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Badge Criteria Guide */}
        <div
          className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isAccessibilityMode
              ? 'bg-black border-amber-400 text-white'
              : 'bg-slate-950/90 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">
              Complete rescues and claim quickly (&lt;10m) to climb the ranks and unlock badges!
            </span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              isAccessibilityMode
                ? 'min-h-[44px] bg-amber-400 text-black font-extrabold hover:bg-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
