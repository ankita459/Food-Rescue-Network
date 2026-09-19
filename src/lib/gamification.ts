import { GamificationBadge, BadgeId, SurplusListing, UserProfile } from '../types';

export const AVAILABLE_BADGES: GamificationBadge[] = [
  {
    id: 'first-rescue',
    name: 'First Rescue',
    description: 'Awarded on completing your very first civic food rescue mission.',
    iconName: 'Award',
    criteria: 'Complete at least 1 food rescue',
    colorScheme: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      badgeBg: 'bg-amber-500',
    },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Rapid-response volunteer: Claimed & finalized handover in under 10 minutes.',
    iconName: 'Zap',
    criteria: 'Rescue claimed & routed in < 10 mins',
    colorScheme: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      badgeBg: 'bg-rose-500',
    },
  },
  {
    id: 'community-anchor',
    name: 'Community Anchor',
    description: 'A trusted backbone of the network with 3+ completed community food drops.',
    iconName: 'Anchor',
    criteria: 'Complete 3 or more food rescues',
    colorScheme: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      text: 'text-sky-300',
      badgeBg: 'bg-sky-500',
    },
  },
  {
    id: 'zero-waste-hero',
    name: 'Zero Waste Hero',
    description: 'Diverted massive surplus volume (>50 kg) directly to emergency hunger relief.',
    iconName: 'Leaf',
    criteria: 'Divert over 50kg of food from landfills',
    colorScheme: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      badgeBg: 'bg-emerald-500',
    },
  },
];

/**
 * Dynamically evaluate which badges a volunteer has earned based on:
 * - Completed rescues stored in listings state
 * - User stats (rescuesCount, totalKgRescued, fastestClaimMinutes)
 */
export function computeUserBadges(
  userUid: string,
  userDisplayName: string,
  listings: SurplusListing[],
  userProfile?: UserProfile | null,
  rescuesCountOverride?: number,
  totalKgOverride?: number
): {
  earnedBadges: BadgeId[];
  completedListings: SurplusListing[];
  totalRescues: number;
  totalKg: number;
  mealsSaved: number;
  fastestMins: number;
  primaryBadge?: GamificationBadge;
} {
  // Filter completed rescues claimed by this user
  const completedListings = listings.filter((l) => {
    if (l.status !== 'completed') return false;
    if (userUid && l.claimedByUid && l.claimedByUid === userUid) return true;
    if (userDisplayName && l.claimedBy && l.claimedBy.toLowerCase() === userDisplayName.toLowerCase()) return true;
    return false;
  });

  const stateRescuesCount = completedListings.length;
  const profileRescues = userProfile?.rescuesCount || 0;
  const totalRescues = Math.max(stateRescuesCount, profileRescues, rescuesCountOverride || 0);

  const stateKg = completedListings.reduce((sum, l) => sum + (l.weightInKg || 0), 0);
  const profileKg = userProfile?.totalKgRescued || 0;
  const totalKg = Math.max(stateKg, profileKg, totalKgOverride || 0);

  const mealsSaved = userProfile?.mealsSaved ? Math.max(userProfile.mealsSaved, Math.round(totalKg * 2.5)) : Math.round(totalKg * 2.5);

  // Check fastest claim / dispatch duration in minutes
  let fastestMins = userProfile?.fastestClaimMinutes || 999;
  for (const l of completedListings) {
    if (l.claimedAt && l.completedAt) {
      const diffMin = Math.max(1, Math.round((l.completedAt - l.claimedAt) / (60 * 1000)));
      if (diffMin < fastestMins) fastestMins = diffMin;
    } else if (l.createdAt && l.claimedAt) {
      const diffMin = Math.max(1, Math.round((l.claimedAt - l.createdAt) / (60 * 1000)));
      if (diffMin < fastestMins) fastestMins = diffMin;
    }
  }

  const earned = new Set<BadgeId>(userProfile?.earnedBadges || []);

  // 1. First Rescue badge: >= 1 completed rescue
  if (totalRescues >= 1) {
    earned.add('first-rescue');
  }

  // 2. Speed Demon badge: claim or turnaround <= 10 mins
  if (fastestMins <= 10 || completedListings.some((l) => l.initialExpiryMinutes <= 15)) {
    earned.add('speed-demon');
  }

  // 3. Community Anchor badge: >= 3 completed rescues or >= 30 kg
  if (totalRescues >= 3 || totalKg >= 30) {
    earned.add('community-anchor');
  }

  // 4. Zero Waste Hero badge: >= 50 kg diverted
  if (totalKg >= 50) {
    earned.add('zero-waste-hero');
  }

  const earnedArray = Array.from(earned);

  // Find primary badge (highest achievement unlocked)
  let primaryBadge: GamificationBadge | undefined = undefined;
  if (earnedArray.includes('zero-waste-hero')) {
    primaryBadge = AVAILABLE_BADGES.find((b) => b.id === 'zero-waste-hero');
  } else if (earnedArray.includes('community-anchor')) {
    primaryBadge = AVAILABLE_BADGES.find((b) => b.id === 'community-anchor');
  } else if (earnedArray.includes('speed-demon')) {
    primaryBadge = AVAILABLE_BADGES.find((b) => b.id === 'speed-demon');
  } else if (earnedArray.includes('first-rescue')) {
    primaryBadge = AVAILABLE_BADGES.find((b) => b.id === 'first-rescue');
  }

  return {
    earnedBadges: earnedArray,
    completedListings,
    totalRescues,
    totalKg,
    mealsSaved,
    fastestMins: fastestMins === 999 ? 0 : fastestMins,
    primaryBadge,
  };
}

/**
 * Returns detailed progress information for each badge
 */
export function getBadgeProgressList(
  totalRescues: number,
  totalKg: number,
  fastestMins: number,
  earnedBadges: BadgeId[]
) {
  return AVAILABLE_BADGES.map((badge) => {
    const isUnlocked = earnedBadges.includes(badge.id);
    let progressPercent = 0;
    let progressLabel = '';

    switch (badge.id) {
      case 'first-rescue':
        progressPercent = isUnlocked ? 100 : totalRescues > 0 ? 100 : 0;
        progressLabel = isUnlocked ? 'Completed' : '0/1 Rescues';
        break;
      case 'speed-demon':
        progressPercent = isUnlocked ? 100 : fastestMins > 0 && fastestMins <= 20 ? 60 : 25;
        progressLabel = isUnlocked ? 'Under 10m' : fastestMins > 0 ? `${fastestMins}m best` : '10m target';
        break;
      case 'community-anchor':
        progressPercent = isUnlocked ? 100 : Math.min(100, Math.round((totalRescues / 3) * 100));
        progressLabel = isUnlocked ? '3+ Rescues' : `${Math.min(totalRescues, 3)}/3 Rescues`;
        break;
      case 'zero-waste-hero':
        progressPercent = isUnlocked ? 100 : Math.min(100, Math.round((totalKg / 50) * 100));
        progressLabel = isUnlocked ? `${totalKg}kg Diverted` : `${Math.min(totalKg, 50)}/50 kg`;
        break;
    }

    return {
      ...badge,
      isUnlocked,
      progressPercent,
      progressLabel,
    };
  });
}
