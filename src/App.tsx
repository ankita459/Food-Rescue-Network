import React, { useState, useEffect } from 'react';
import { HeaderTicker } from './components/HeaderTicker';
import { PostSurplusForm } from './components/PostSurplusForm';
import { RadarFeed } from './components/RadarFeed';
import { SafetyTriageModal } from './components/SafetyTriageModal';
import { ClaimRoutingModal } from './components/ClaimRoutingModal';
import { GoogleMapsFinderModal } from './components/GoogleMapsFinderModal';
import { TransitQRCodeModal } from './components/TransitQRCodeModal';
import { QRVerificationModal } from './components/QRVerificationModal';
import { TopRescuersLeaderboard } from './components/TopRescuersLeaderboard';
import { GamificationBadgeFooter } from './components/GamificationBadgeFooter';
import { SurplusListing, ImpactStats, UserProfile } from './types';
import { getPreSeededListings, INITIAL_IMPACT_STATS, INITIAL_TOP_RESCUERS } from './data/seedData';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection,
  subscribeToSurplusListings,
  saveListingToFirestore,
  updateListingInFirestore,
  subscribeToImpactStats,
  saveImpactStatsToFirestore,
  seedFirestoreIfEmpty,
  subscribeToTopRescuers,
  recordUserRescueCompletion,
  cheerVolunteerInFirestore,
} from './lib/firebase';
import { computeUserBadges } from './lib/gamification';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ShieldCheck, HeartHandshake, Sparkles, CheckCircle, Database, Compass, Trophy } from 'lucide-react';

const STORAGE_LISTINGS_KEY = 'frn_surplus_listings_v2';
const STORAGE_STATS_KEY = 'frn_impact_stats_v2';

export default function App() {
  // 1. User authentication state via Firebase Auth
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  // 2. Listings State with Firestore real-time sync + LocalStorage fallback
  const [listings, setListings] = useState<SurplusListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LISTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved listings from LocalStorage', e);
    }
    return getPreSeededListings();
  });

  // 3. Impact stats state with Firestore real-time sync + LocalStorage fallback
  const [stats, setStats] = useState<ImpactStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved stats from LocalStorage', e);
    }
    return INITIAL_IMPACT_STATS;
  });

  // 4. Synchronized 1-second clock ticker for live countdowns
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Modal states
  const [safetyModalListing, setSafetyModalListing] = useState<SurplusListing | null>(null);
  const [claimModalListing, setClaimModalListing] = useState<SurplusListing | null>(null);
  const [qrModalListing, setQrModalListing] = useState<SurplusListing | null>(null);
  const [verificationModalListing, setVerificationModalListing] = useState<SurplusListing | null>(null);
  const [isMapsRadarOpen, setIsMapsRadarOpen] = useState(false);
  const [mapsRadarDefaultLoc, setMapsRadarDefaultLoc] = useState('San Francisco, CA');
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Leaderboard & Gamification state
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [rescuers, setRescuers] = useState<UserProfile[]>(INITIAL_TOP_RESCUERS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Welcome back, ${user.displayName || 'Volunteer Driver'}! Authenticated via Firebase.`);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Firebase Firestore initialization & real-time synchronization
  useEffect(() => {
    let unsubscribeListings: (() => void) | undefined;
    let unsubscribeStats: (() => void) | undefined;
    let unsubscribeRescuers: (() => void) | undefined;

    async function initFirestore() {
      const connected = await testFirestoreConnection();
      setIsFirestoreConnected(connected);

      // Seed initial data if Firestore collection is fresh
      await seedFirestoreIfEmpty(getPreSeededListings(), INITIAL_IMPACT_STATS);

      // Subscribe to real-time listings updates from Firestore
      unsubscribeListings = subscribeToSurplusListings(
        (remoteListings) => {
          if (remoteListings && remoteListings.length > 0) {
            setListings(remoteListings);
            try {
              localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(remoteListings));
            } catch (e) {
              console.warn(e);
            }
          }
        },
        (err) => {
          console.warn('Using local listings cache due to Firestore listener notice:', err);
        }
      );

      // Subscribe to real-time impact stats updates from Firestore
      unsubscribeStats = subscribeToImpactStats(
        (remoteStats) => {
          if (remoteStats) {
            setStats(remoteStats);
            try {
              localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(remoteStats));
            } catch (e) {
              console.warn(e);
            }
          }
        },
        (err) => {
          console.warn('Using local stats cache due to Firestore listener notice:', err);
        }
      );

      // Subscribe to real-time top rescuers leaderboard from Firestore
      unsubscribeRescuers = subscribeToTopRescuers(
        (remoteRescuers) => {
          if (remoteRescuers && remoteRescuers.length > 0) {
            setRescuers(remoteRescuers);
          }
        },
        (err) => {
          console.warn('Using initial rescuers cache due to Firestore listener notice:', err);
        }
      );
    }

    initFirestore().catch((err) => {
      console.warn('Firestore initialization notice:', err);
    });

    return () => {
      if (unsubscribeListings) unsubscribeListings();
      if (unsubscribeStats) unsubscribeStats();
      if (unsubscribeRescuers) unsubscribeRescuers();
    };
  }, []);

  // Handle Google Sign-in with Firebase Auth
  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      // If popup was blocked or user closed popup, provide friendly notification
      showToast(`Google Sign-In notice: ${err?.message || 'Please enable popups to sign in'}`);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('Signed out of Firebase.');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Add new surplus listing from Provider Input form -> Save to Firestore & local
  const handleAddListing = async (newListing: SurplusListing) => {
    // Add user attribution if signed in
    const listingToSave: SurplusListing = {
      ...newListing,
      createdByUid: currentUser?.uid || undefined,
    };

    // Optimistic UI update
    setListings((prev) => [listingToSave, ...prev]);
    showToast(`Broadcast live: ${listingToSave.foodItem} saved to Firestore rescue radar!`);

    try {
      await saveListingToFirestore(listingToSave);
    } catch (e) {
      console.warn('Firestore write notice, retained in local memory:', e);
    }
  };

  // State Transition Machine (available -> claimed -> completed) -> Sync to Firestore
  const handleUpdateStatus = async (
    listingId: string,
    nextStatus: 'available' | 'claimed' | 'completed'
  ) => {
    const targetItem = listings.find((l) => l.id === listingId);
    if (!targetItem) return;

    let updates: Partial<SurplusListing> = { status: nextStatus };

    if (nextStatus === 'completed' && targetItem.status !== 'completed') {
      const meals = Math.round(targetItem.weightInKg * 2.5);
      const co2 = Math.round(targetItem.weightInKg * 2.0);

      const nextStats: ImpactStats = {
        ...stats,
        mealsSaved: stats.mealsSaved + meals,
        co2DivertedKg: stats.co2DivertedKg + co2,
        totalRescuesCompleted: stats.totalRescuesCompleted + 1,
      };

      updates = {
        status: 'completed',
        completedAt: Date.now(),
      };

      setStats(nextStats);
      showToast(`Impact Recorded! +${meals} Meals Served & +${co2}kg CO2 Diverted.`);

      // Persist impact stats to Firestore
      try {
        await saveImpactStatsToFirestore(nextStats);
      } catch (e) {
        console.warn('Failed to sync impact stats to Firestore:', e);
      }

      // Record rescue completion in user profile & update badges in Firestore
      const claimDurationMins = targetItem.claimedAt
        ? Math.max(1, Math.round((Date.now() - targetItem.claimedAt) / 60000))
        : 8;

      try {
        await recordUserRescueCompletion(
          userUid,
          userDisplayName,
          targetItem.weightInKg,
          meals,
          claimDurationMins,
          currentUser?.photoURL || undefined,
          currentUser?.email || undefined
        );
      } catch (e) {
        console.warn('Failed to record rescuer metrics:', e);
      }

      // Dynamic milestone toast announcements
      if (claimDurationMins <= 10 && !userGamification.earnedBadges.includes('speed-demon')) {
        showToast("⚡ New Badge Unlocked: 'Speed Demon' (Claimed under 10m)!");
      } else if (!userGamification.earnedBadges.includes('first-rescue')) {
        showToast("🏅 New Badge Unlocked: 'First Rescue'!");
      } else if (
        (userGamification.totalRescues + 1 >= 3 || userGamification.totalKg + targetItem.weightInKg >= 30) &&
        !userGamification.earnedBadges.includes('community-anchor')
      ) {
        showToast("⚓ New Badge Unlocked: 'Community Anchor' (3+ Rescues)! ");
      }
    } else if (nextStatus === 'available') {
      updates = {
        status: 'available',
        claimedAt: undefined,
        claimedBy: undefined,
      };
    } else if (nextStatus === 'claimed') {
      updates = {
        status: 'claimed',
        claimedAt: Date.now(),
        claimedBy: currentUser?.displayName || 'Volunteer Driver',
      };
    }

    // Update local state immediately
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, ...updates } : item))
    );

    // Sync to Firestore
    try {
      await updateListingInFirestore(listingId, updates);
    } catch (e) {
      console.warn('Failed to update listing in Firestore:', e);
    }
  };

  // Confirm claim and set route assignment with unique verification token & QR badge
  const handleConfirmClaim = async (
    listingId: string,
    nodeName: string,
    volunteerName: string
  ) => {
    // Generate unique scannable claim verification token
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueClaimToken = `FRN-2026-${Date.now().toString(36).toUpperCase().slice(-4)}-${randomHex}`;

    const updates: Partial<SurplusListing> = {
      status: 'claimed',
      claimedAt: Date.now(),
      claimedBy: volunteerName,
      claimedByUid: currentUser?.uid || undefined,
      destinationNode: nodeName,
      claimToken: uniqueClaimToken,
    };

    let updatedClaimedItem: SurplusListing | null = null;
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          updatedClaimedItem = { ...item, ...updates };
          return updatedClaimedItem;
        }
        return item;
      })
    );

    showToast(`Claim Locked! Verification token ${uniqueClaimToken} generated.`);

    // Automatically display scannable QR verification badge / modal
    if (updatedClaimedItem) {
      setVerificationModalListing(updatedClaimedItem);
    }

    try {
      await updateListingInFirestore(listingId, updates);
    } catch (e) {
      console.warn('Failed to sync claim to Firestore:', e);
    }
  };

  // Finalize rescue with Handover Confirmation
  const handleConfirmHandover = async (listingId: string) => {
    await handleUpdateStatus(listingId, 'completed');
    setVerificationModalListing((prev) =>
      prev && prev.id === listingId
        ? { ...prev, status: 'completed', completedAt: Date.now() }
        : prev
    );
  };

  // Reset to initial 5 realistic seed items with refreshed timestamps
  const handleResetSeedData = async () => {
    const freshListings = getPreSeededListings();
    setListings(freshListings);
    setStats(INITIAL_IMPACT_STATS);

    try {
      localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(freshListings));
      localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(INITIAL_IMPACT_STATS));
      await seedFirestoreIfEmpty(freshListings, INITIAL_IMPACT_STATS);
    } catch (e) {
      console.warn(e);
    }
    showToast('Reset radar to 5 fresh hyper-local active listings synced with Firestore!');
  };

  // Volunteer identity & computed gamification badges
  const userUid = currentUser?.uid || 'volunteer-local-lead';
  const userDisplayName = currentUser?.displayName || (currentUser ? 'Volunteer Driver' : 'You (Volunteer)');
  const userProfileInList = rescuers.find((r) => r.uid === userUid);
  const userGamification = computeUserBadges(
    userUid,
    userDisplayName,
    listings,
    userProfileInList
  );

  const handleCheerVolunteer = async (uid: string) => {
    try {
      await cheerVolunteerInFirestore(uid);
      setRescuers((prev) =>
        prev.map((r) => (r.uid === uid ? { ...r, cheersCount: (r.cheersCount || 0) + 1 } : r))
      );
      showToast('👏 Applauded volunteer rescuer on Firebase!');
    } catch (e) {
      console.warn('Cheer volunteer notice:', e);
    }
  };

  // Summary counts for header
  const availableCount = listings.filter((l) => l.status === 'available').length;
  const claimedCount = listings.filter((l) => l.status === 'claimed').length;
  const urgentCount = listings.filter(
    (l) => l.status === 'available' && (l.expiresAt - currentTime) / 1000 / 60 < 20
  ).length;

  return (
    <div
      id="app-root"
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 ${
        isAccessibilityMode ? 'accessibility-mode' : ''
      }`}
    >
      {/* 1. Top Impact Header Ticker with Google Auth & Firestore status */}
      <HeaderTicker
        stats={stats}
        availableCount={availableCount}
        claimedCount={claimedCount}
        urgentCount={urgentCount}
        currentUser={currentUser}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
        onOpenMapsRadar={() => setIsMapsRadarOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onResetData={handleResetSeedData}
        isFirestoreConnected={isFirestoreConnected}
        isAccessibilityMode={isAccessibilityMode}
        onToggleAccessibilityMode={() => setIsAccessibilityMode((prev) => !prev)}
        userEarnedBadges={userGamification.earnedBadges}
        userPrimaryBadge={userGamification.primaryBadge?.name}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border-2 border-emerald-500/80 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content: Split-Screen Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* User context banner when signed in */}
        {currentUser && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Signed in as <strong className="text-white">{currentUser.displayName || currentUser.email}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">Claims & broadcasts linked to your Firebase user profile</span>
            </div>

            <button
              onClick={() => {
                setMapsRadarDefaultLoc('San Francisco, CA');
                setIsMapsRadarOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Nearby Verified Shelters</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Post Surplus / Provider Input (5 cols on lg) */}
          <div className="lg:col-span-5 w-full">
            <PostSurplusForm
              onAddListing={handleAddListing}
              currentUserId={currentUser?.uid}
              currentUserName={currentUser?.displayName || undefined}
            />

            {/* Micro Civic Protocol Info Card */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Good Samaritan Food Donation Act & Google Maps Grounding</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Surplus donations coordinated via Food Rescue Network adhere to ISO 22000 & HACCP temperature guidelines. Powered by Gemini 3.5 Flash with Google Maps tool for live verified food banks and transit route validation.
              </p>
            </div>
          </div>

          {/* Right Panel: Live Rescue Radar Feed (7 cols on lg) */}
          <div className="lg:col-span-7 w-full">
            <RadarFeed
              listings={listings}
              currentTime={currentTime}
              onOpenSafetyModal={(item) => setSafetyModalListing(item)}
              onOpenClaimModal={(item) => setClaimModalListing(item)}
              onOpenQRModal={(item) => setQrModalListing(item)}
              onOpenVerificationModal={(item) => setVerificationModalListing(item)}
              onUpdateStatus={handleUpdateStatus}
              isAccessibilityMode={isAccessibilityMode}
            />
          </div>
        </div>
      </main>

      {/* 4. AI Quick Triage Modal / Drawer */}
      <SafetyTriageModal
        listing={safetyModalListing}
        onClose={() => setSafetyModalListing(null)}
      />

      {/* Claim & Routing Modal (with Google Maps route intel) */}
      <ClaimRoutingModal
        listing={claimModalListing}
        onConfirmClaim={handleConfirmClaim}
        onClose={() => setClaimModalListing(null)}
        onOpenQRModal={(item) => setQrModalListing(item)}
      />

      {/* QR Verification Modal & Handover Finalization */}
      <QRVerificationModal
        listing={verificationModalListing}
        isOpen={Boolean(verificationModalListing)}
        onClose={() => setVerificationModalListing(null)}
        onConfirmHandover={handleConfirmHandover}
      />

      {/* QR Code Transit Modal for 'Available' and Active Listings */}
      <TransitQRCodeModal
        listing={qrModalListing}
        isOpen={Boolean(qrModalListing)}
        onClose={() => setQrModalListing(null)}
      />

      {/* Google Maps Rescue Radar Modal (gemini-3.5-flash with googleMaps tool) */}
      <GoogleMapsFinderModal
        isOpen={isMapsRadarOpen}
        onClose={() => setIsMapsRadarOpen(false)}
        defaultLocation={mapsRadarDefaultLoc}
        onSelectNode={(nodeName) => {
          showToast(`Selected destination node: ${nodeName}`);
        }}
      />

      {/* Regional Top Rescuers Leaderboard Modal */}
      <TopRescuersLeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        rescuers={rescuers}
        currentUserProfile={{
          uid: userUid,
          displayName: userDisplayName,
          photoURL: currentUser?.photoURL || undefined,
          rescuesCount: userGamification.totalRescues,
          totalKgRescued: userGamification.totalKg,
          mealsSaved: userGamification.mealsSaved,
          fastestClaimMinutes: userGamification.fastestMins,
          earnedBadges: userGamification.earnedBadges,
        }}
        onCheerVolunteer={handleCheerVolunteer}
        isAccessibilityMode={isAccessibilityMode}
      />

      {/* Lightweight Gamification / Donor Badge Footer */}
      <GamificationBadgeFooter
        totalRescues={userGamification.totalRescues}
        totalKg={userGamification.totalKg}
        fastestClaimMinutes={userGamification.fastestMins}
        earnedBadges={userGamification.earnedBadges}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        isAccessibilityMode={isAccessibilityMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-400">Food Rescue Network (FRN)</span>
            <span>• Hyper-Local Surplus Coordination Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Firebase Firestore Connected</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-sky-400" />
              <span>Google Maps Grounding (gemini-3.5-flash)</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-medium">Zero Food Waste Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
