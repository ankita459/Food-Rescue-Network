import React, { useState } from 'react';
import {
  Award,
  Zap,
  Anchor,
  Leaf,
  Trophy,
  Lock,
  CheckCircle,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BadgeId, GamificationBadge } from '../types';
import { AVAILABLE_BADGES, getBadgeProgressList } from '../lib/gamification';

interface GamificationBadgeFooterProps {
  totalRescues: number;
  totalKg: number;
  fastestClaimMinutes: number;
  earnedBadges: BadgeId[];
  onOpenLeaderboard: () => void;
  isAccessibilityMode?: boolean;
}

export const GamificationBadgeFooter: React.FC<GamificationBadgeFooterProps> = ({
  totalRescues,
  totalKg,
  fastestClaimMinutes,
  earnedBadges,
  onOpenLeaderboard,
  isAccessibilityMode = false,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<GamificationBadge | null>(null);

  const badgeProgress = getBadgeProgressList(
    totalRescues,
    totalKg,
    fastestClaimMinutes,
    earnedBadges
  );

  const renderBadgeIcon = (id: BadgeId, isUnlocked: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 ${
      isUnlocked
        ? id === 'first-rescue'
          ? 'text-amber-400'
          : id === 'speed-demon'
          ? 'text-rose-400'
          : id === 'community-anchor'
          ? 'text-sky-400'
          : 'text-emerald-400'
        : 'text-slate-500'
    }`;

    switch (id) {
      case 'first-rescue':
        return <Award className={iconClass} />;
      case 'speed-demon':
        return <Zap className={iconClass} />;
      case 'community-anchor':
        return <Anchor className={iconClass} />;
      case 'zero-waste-hero':
        return <Leaf className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const unlockedCount = badgeProgress.filter((b) => b.isUnlocked).length;

  return (
    <footer
      id="gamification-badge-footer"
      className={`w-full border-t transition-all mt-auto ${
        isAccessibilityMode
          ? 'bg-black border-amber-400 text-white'
          : 'bg-slate-950/95 border-slate-800/80 backdrop-blur-md text-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Left Title & Status Overview */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isAccessibilityMode
                    ? 'bg-amber-400 text-black font-black'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Civic Rescuer Badges
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      unlockedCount > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {unlockedCount} / {badgeProgress.length} Unlocked
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Earned dynamically through verified surplus pickups and speedy routing
                </p>
              </div>
            </div>

            {/* Leaderboard CTA Button */}
            <button
              id="open-top-rescuers-btn"
              onClick={onOpenLeaderboard}
              title="View the regional Top Rescuers Leaderboard"
              className={`md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isAccessibilityMode
                  ? 'min-h-[44px] bg-amber-400 text-black font-extrabold border-2 border-amber-300'
                  : 'bg-gradient-to-r from-amber-500/20 to-yellow-600/20 hover:from-amber-500/30 hover:to-yellow-600/30 border border-amber-500/40 text-amber-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
          </div>

          {/* Center Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
            {badgeProgress.map((badge) => {
              const isUnlocked = badge.isUnlocked;

              return (
                <button
                  key={badge.id}
                  id={`badge-chip-${badge.id}`}
                  onClick={() => setSelectedBadge(badge)}
                  className={`group text-left p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isAccessibilityMode
                      ? isUnlocked
                        ? 'min-h-[44px] bg-black border-2 border-amber-400 text-white'
                        : 'min-h-[44px] bg-zinc-950 border border-slate-700 opacity-60 text-slate-300'
                      : isUnlocked
                      ? `${badge.colorScheme.bg} ${badge.colorScheme.border} hover:border-emerald-400/60 shadow-sm`
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {renderBadgeIcon(badge.id, isUnlocked)}
                      <span
                        className={`text-xs font-bold truncate ${
                          isUnlocked ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {badge.name}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                    )}
                  </div>

                  {/* Progress Bar & Target */}
                  <div className="w-full">
                    <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isUnlocked
                            ? badge.id === 'first-rescue'
                              ? 'bg-amber-400'
                              : badge.id === 'speed-demon'
                              ? 'bg-rose-400'
                              : badge.id === 'community-anchor'
                              ? 'bg-sky-400'
                              : 'bg-emerald-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}
                      >
                        {badge.progressLabel}
                      </span>
                      <span className="text-[9px] text-slate-500 group-hover:text-slate-400">
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Leaderboard Action for Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="open-top-rescuers-desktop-btn"
              onClick={onOpenLeaderboard}
              title="Open full regional volunteer leaderboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isAccessibilityMode
                  ? 'min-h-[44px] bg-amber-400 text-black border-2 border-amber-300 font-extrabold hover:bg-amber-300'
                  : 'bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-yellow-600/20 hover:from-amber-500/30 hover:to-yellow-600/30 border border-amber-500/40 text-amber-200'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Top Rescuers Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400/80" />
            </button>
          </div>
        </div>
      </div>

      {/* Badge Lore / Details Dialog */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border ${
              isAccessibilityMode
                ? 'bg-black border-4 border-amber-400 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedBadge.colorScheme.bg
                  } ${selectedBadge.colorScheme.border} border`}
                >
                  {renderBadgeIcon(
                    selectedBadge.id,
                    earnedBadges.includes(selectedBadge.id)
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedBadge.name}
                  </h3>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                      earnedBadges.includes(selectedBadge.id)
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {earnedBadges.includes(selectedBadge.id)
                      ? '✓ Unlocked & Active'
                      : '🔒 Locked Milestone'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ${
                  isAccessibilityMode ? 'min-h-[44px] min-w-[44px] border border-amber-400' : ''
                }`}
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {selectedBadge.description}
            </p>

            <div
              className={`p-2.5 rounded-xl border text-xs mb-4 ${
                isAccessibilityMode
                  ? 'bg-zinc-950 border-amber-400'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Unlock Requirement:
              </div>
              <div className="text-slate-200 font-medium">
                {selectedBadge.criteria}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedBadge(null);
                  onOpenLeaderboard();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isAccessibilityMode
                    ? 'bg-amber-400 text-black hover:bg-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>View on Leaderboard</span>
              </button>
              <button
                onClick={() => setSelectedBadge(null)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isAccessibilityMode
                    ? 'bg-black text-amber-400 border border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
