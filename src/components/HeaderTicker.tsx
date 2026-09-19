import React from 'react';
import {
  Radio,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Leaf,
  Utensils,
  Award,
  Database,
  Compass,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Contrast,
  Eye,
  Trophy,
  Zap,
  Anchor,
} from 'lucide-react';
import { ImpactStats, BadgeId } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderTickerProps {
  stats: ImpactStats;
  availableCount: number;
  claimedCount: number;
  urgentCount: number;
  currentUser: FirebaseUser | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenMapsRadar: () => void;
  onOpenLeaderboard: () => void;
  onResetData: () => void;
  isFirestoreConnected: boolean;
  isAccessibilityMode: boolean;
  onToggleAccessibilityMode: () => void;
  userEarnedBadges?: BadgeId[];
  userPrimaryBadge?: string;
}

export const HeaderTicker: React.FC<HeaderTickerProps> = ({
  stats,
  availableCount,
  claimedCount,
  urgentCount,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  onOpenMapsRadar,
  onOpenLeaderboard,
  onResetData,
  isFirestoreConnected,
  isAccessibilityMode,
  onToggleAccessibilityMode,
  userEarnedBadges = [],
  userPrimaryBadge,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      {/* Top Banner Ticker with Impact Counters */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Live Radar Pulse Tag & Firestore status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Live Rescue Radar Active
            </span>
            <span className="hidden md:inline-block text-slate-600">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <Database className={`w-3 h-3 ${isFirestoreConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isFirestoreConnected ? 'Firestore Live Sync' : 'Connecting to Firestore...'}</span>
            </span>
            {isAccessibilityMode && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-400 text-black border border-amber-300 shadow-sm animate-in fade-in">
                <Eye className="w-3 h-3 text-black" />
                <span>Field Mode Active (WCAG AA/AAA)</span>
              </span>
            )}
          </div>

          {/* Core Ticker Metrics: Meals Saved | CO2 Diverted | Active Nodes */}
          <div className="flex items-center gap-3 sm:gap-6 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
            <div className="flex items-center gap-1.5" title="Total meals rescued and served to shelters">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">Meals Saved:</span>
              <span className="font-bold text-white tracking-tight font-mono text-emerald-300">
                {stats.mealsSaved}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5" title="Carbon emissions prevented by keeping organic food out of landfills">
              <Leaf className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 font-medium">CO₂ Diverted:</span>
              <span className="font-bold text-white tracking-tight font-mono text-teal-300">
                {stats.co2DivertedKg}kg
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5" title="Active receiving emergency shelters & community kitchens">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Active Nodes:</span>
              <span className="font-bold text-white tracking-tight font-mono text-amber-300">
                {stats.activeNodes}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {urgentCount} Critical (&lt;20m)
              </span>
            )}
            <button
              id="reset-demo-data-btn"
              onClick={onResetData}
              title="Reset radar listings to fresh 5 demo items in Firestore"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Refresh Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-400/30">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Food Rescue Network
              </h1>
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                Hyper-Local Radar
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Immediate surplus food dispatch & emergency rescue coordination
            </p>
          </div>
        </div>

        {/* Action Controls: Accessibility Mode, Google Maps Radar & Google Firebase Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* High-Contrast Field & Accessibility Mode Toggle */}
          <button
            id="toggle-accessibility-mode-btn"
            type="button"
            role="switch"
            aria-checked={isAccessibilityMode}
            onClick={onToggleAccessibilityMode}
            title={
              isAccessibilityMode
                ? 'High-Contrast Field Mode is ON. Click to switch to Standard Mode.'
                : 'Switch to Field / High-Contrast Accessibility Mode (WCAG AAA/AA contrast, enlarged 44px+ touch-friendly targets)'
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isAccessibilityMode
                ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-300 ring-2 ring-amber-400 shadow-amber-400/20 font-extrabold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Contrast className={`w-4 h-4 shrink-0 ${isAccessibilityMode ? 'text-black' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Field / Accessibility</span>
            <span className="sm:hidden">Field</span>
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold ${
                isAccessibilityMode
                  ? 'bg-black text-amber-300'
                  : 'bg-slate-900 text-slate-400 border border-slate-700'
              }`}
            >
              {isAccessibilityMode ? 'HIGH CONTRAST' : 'STANDARD'}
            </span>
          </button>

          {/* Google Maps Grounding Radar Button */}
          <button
            id="open-google-maps-radar-btn"
            onClick={onOpenMapsRadar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Google Maps Radar</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 hidden md:inline">
              gemini-3.5-flash
            </span>
          </button>

          {/* Top Rescuers Leaderboard Button */}
          <button
            id="header-top-rescuers-btn"
            onClick={onOpenLeaderboard}
            title="View the Top Rescuers regional leaderboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isAccessibilityMode
                ? 'min-h-[44px] bg-black text-amber-400 border-2 border-amber-400 hover:bg-amber-400 hover:text-black font-extrabold'
                : 'bg-gradient-to-r from-amber-500/15 to-yellow-600/15 hover:from-amber-500/25 hover:to-yellow-600/25 border border-amber-500/30 text-amber-300 hover:border-amber-500/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Top Rescuers</span>
            <span className="sm:hidden">Rank</span>
          </button>

          {/* Volunteer Status / Profile Chip */}
          {userEarnedBadges.length > 0 && (
            <button
              id="header-profile-badge-chip"
              onClick={onOpenLeaderboard}
              title={`Unlocked Status Badges (${userEarnedBadges.length}): Click to view Leaderboard & Badges`}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAccessibilityMode
                  ? 'bg-black text-amber-300 border-amber-400'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-sm'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{userPrimaryBadge || `${userEarnedBadges.length} Badges`}</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-200 px-1.5 py-0.2 rounded font-mono font-bold">
                {userEarnedBadges.length}
              </span>
            </button>
          )}

          {/* Firebase Auth Google Sign-in / User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-emerald-400/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.displayName || 'Volunteer Driver'}
                </div>
                <div className="text-[10px] text-emerald-400 leading-tight">
                  Firebase Verified
                </div>
              </div>
              <button
                onClick={onSignOut}
                title="Sign out of Firebase"
                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/60 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="google-signin-btn"
              onClick={onSignInWithGoogle}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {/* Google G icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          )}

          {/* Rescues Count Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{stats.totalRescuesCompleted} Rescues Logged</span>
          </div>
        </div>
      </div>
    </header>
  );
};
