export type DietaryType = 'Veg' | 'Vegan' | 'Dairy' | 'Bakery';

export type ListingStatus = 'available' | 'claimed' | 'completed' | 'expired';

export interface SafetyTip {
  headline: string;
  transitInstruction: string;
  tempRequirement: string;
  packagingSuitability: string;
  safeWindowMins: number;
  criticalHazardWarning: string;
}

export interface SurplusListing {
  id: string;
  foodItem: string;
  quantity: string;
  weightInKg: number;
  providerName: string;
  providerLocation: string;
  dietaryType: DietaryType;
  packagingType: string;
  initialExpiryMinutes: number;
  createdAt: number; // epoch ms
  expiresAt: number; // epoch ms
  status: ListingStatus;
  createdByUid?: string;
  claimedAt?: number;
  claimedBy?: string;
  claimedByUid?: string;
  deliveryStage?: 'en-route-pickup' | 'in-transit' | 'delivered';
  completedAt?: number;
  claimToken?: string;
  safetyTip: SafetyTip;
  destinationNode?: string;
}

export interface ImpactStats {
  mealsSaved: number;
  co2DivertedKg: number;
  activeNodes: number;
  totalRescuesCompleted: number;
}

export type MessageRole = 'volunteer' | 'provider' | 'coordinator';

export interface RescueMessage {
  id: string;
  listingId: string;
  senderRole: MessageRole;
  senderName: string;
  senderUid?: string;
  text: string;
  timestamp: number;
  quickTag?: 'en-route' | 'arriving-10m' | 'at-dock' | 'loaded' | 'delayed' | 'general';
}

export type BadgeId = 'first-rescue' | 'speed-demon' | 'community-anchor' | 'zero-waste-hero';

export interface GamificationBadge {
  id: BadgeId;
  name: string;
  description: string;
  iconName: 'Award' | 'Zap' | 'Anchor' | 'Leaf';
  criteria: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  rescuesCount: number;
  broadcastsCount?: number;
  totalKgRescued: number;
  mealsSaved: number;
  fastestClaimMinutes?: number;
  earnedBadges: BadgeId[];
  createdAt: number;
  lastActiveAt?: number;
  cheersCount?: number;
}
