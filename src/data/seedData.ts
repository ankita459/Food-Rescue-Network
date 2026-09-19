import { SurplusListing, SafetyTip, DietaryType, UserProfile } from '../types';

export const INITIAL_IMPACT_STATS = {
  mealsSaved: 42,
  co2DivertedKg: 84,
  activeNodes: 4,
  totalRescuesCompleted: 14,
};

export const RESCUE_DESTINATION_NODES = [
  { name: 'Anand Shelter Home (Capacity: 80)', distance: '1.2 km', travelTimeMin: 8 },
  { name: 'Seva Community Kitchen & Day Center', distance: '2.4 km', travelTimeMin: 14 },
  { name: 'St. Jude Children Haven Center', distance: '3.1 km', travelTimeMin: 18 },
  { name: 'Railway Transit Labor Mess Night Wing', distance: '1.8 km', travelTimeMin: 11 },
];

export function generateSmartSafetyTip(
  foodItem: string,
  dietaryType: DietaryType,
  packagingType: string,
  remainingMinutes: number
): SafetyTip {
  const lower = foodItem.toLowerCase();

  // Rice / Biryani / Pulao specific (Bacillus cereus risk if warm/lukewarm)
  if (lower.includes('biryani') || lower.includes('pulao') || lower.includes('rice') || lower.includes('khichdi')) {
    return {
      headline: 'Cooked Starch / Rice Protocol: Bacillus cereus prevention active.',
      transitInstruction: `Hot-hold container verified; maintain temp > 60°C during ${Math.min(remainingMinutes, 20)}-min transit.`,
      tempRequirement: 'Keep > 60°C (Hot hold) or chill rapidly < 5°C',
      packagingSuitability: `${packagingType} - Sealed steam barrier required; do not leave at ambient room temp.`,
      safeWindowMins: Math.max(10, remainingMinutes),
      criticalHazardWarning: 'High moisture grain alert: Never re-warm rice more than once at recipient kitchen.',
    };
  }

  // Dairy / Paneer / Milk based
  if (lower.includes('paneer') || lower.includes('curd') || lower.includes('milk') || dietaryType === 'Dairy') {
    return {
      headline: 'Fresh Dairy/Protein Protocol: Rapid bacterial proliferation barrier.',
      transitInstruction: `Insulated food carrier advised; ensure lid seal intact and distribute within ${Math.min(remainingMinutes, 25)} mins.`,
      tempRequirement: 'Critical window: either hot-hold > 63°C or active cold chain < 4°C',
      packagingSuitability: `${packagingType} - Verify leak-proof silicone gasket and heat retention seal.`,
      safeWindowMins: Math.max(12, remainingMinutes),
      criticalHazardWarning: 'Proteins spoil rapidly in 20°C–45°C danger zone; perform olfactory test upon unboxing.',
    };
  }

  // Fresh cut fruits / Salads (Cold chain)
  if (lower.includes('fruit') || lower.includes('salad') || lower.includes('melon') || lower.includes('cut')) {
    return {
      headline: 'Cold Chain Perishable Protocol: Acidic/Enzymatic oxidation control.',
      transitInstruction: `Keep out of direct sunlight; ice-pack insulated pouch recommended for ${Math.min(remainingMinutes, 15)}-min transport.`,
      tempRequirement: 'Maintain cold temp < 8°C (Do NOT allow warming)',
      packagingSuitability: `${packagingType} - Ventilated food-grade clear container with condensation drain.`,
      safeWindowMins: Math.max(15, remainingMinutes),
      criticalHazardWarning: 'Raw cut produce has high surface moisture; consume immediately upon arrival at shelter.',
    };
  }

  // Bakery / Breads / Chapati / Roti
  if (lower.includes('chapati') || lower.includes('roti') || lower.includes('bread') || lower.includes('pastr')) {
    return {
      headline: 'Dry Bakery & Flatbread Protocol: Moisture condensation control.',
      transitInstruction: `Keep dry with parchment lining; distribute within ${Math.min(remainingMinutes, 45)} mins to prevent moisture sogging.`,
      tempRequirement: 'Ambient dry (< 26°C) or warm (> 55°C)',
      packagingSuitability: `${packagingType} - Foil wrapped with breathable paper top to minimize moisture buildup.`,
      safeWindowMins: Math.max(20, remainingMinutes),
      criticalHazardWarning: 'Avoid steam entrapment which causes dough spoilage and rapid mould spore development.',
    };
  }

  // General Cooked Stew / Subzi / Dal
  return {
    headline: 'Hot Cooked Meal Protocol: HACCP Standard Food Safety Certified.',
    transitInstruction: `Hot-hold container verified; maintain temp > 60°C during ${Math.min(remainingMinutes, 20)}-min transit.`,
    tempRequirement: 'Maintain above 60°C throughout rescue routing',
    packagingSuitability: `${packagingType} - Food-grade thermal insulation container approved for immediate dispatch.`,
    safeWindowMins: Math.max(15, remainingMinutes),
    criticalHazardWarning: 'Check container seal tamper-evident band prior to shelter handover.',
  };
}

export function getPreSeededListings(): SurplusListing[] {
  const now = Date.now();

  return [
    {
      id: 'rescue-1',
      foodItem: '5kg Paneer Biryani',
      quantity: '5kg (~12 portions)',
      weightInKg: 5,
      providerName: 'Hotel Grand Banquets',
      providerLocation: 'Grand Kitchen Service Bay, Gate 2',
      dietaryType: 'Veg',
      packagingType: 'Insulated Hot-Box',
      initialExpiryMinutes: 28,
      createdAt: now - 2 * 60 * 1000,
      expiresAt: now + 28 * 60 * 1000,
      status: 'available',
      destinationNode: 'Anand Shelter Home (Capacity: 80)',
      safetyTip: {
        headline: 'Dairy & Basmati Integrity: High thermal mass retention.',
        transitInstruction: 'Hot-hold container verified; maintain temp > 60°C during 15-min transit.',
        tempRequirement: 'Maintain > 62°C core temp',
        packagingSuitability: 'Insulated Hot-Box with heavy stainless-steel clamp latches.',
        safeWindowMins: 28,
        criticalHazardWarning: 'Do not allow cooling below 55°C before final shelter distribution.',
      },
    },
    {
      id: 'rescue-2',
      foodItem: '8kg Veg Pulao',
      quantity: '8kg (~20 portions)',
      weightInKg: 8,
      providerName: 'Campus Central Mess',
      providerLocation: 'Hostel Quadrangle Loading Dock',
      dietaryType: 'Veg',
      packagingType: 'Thermal Sealed Cans',
      initialExpiryMinutes: 15,
      createdAt: now - 3 * 60 * 1000,
      expiresAt: now + 15 * 60 * 1000,
      status: 'available',
      destinationNode: 'Seva Community Kitchen & Day Center',
      safetyTip: {
        headline: 'Critical Window Protocol: High thermal decay risk detected.',
        transitInstruction: 'Express dispatch route active; transit time must remain < 12 mins to avoid bacterial danger zone.',
        tempRequirement: 'Core temp registered at 68°C at packaging; dispatch immediately.',
        packagingSuitability: 'Thermal Sealed Cans with silicone gasket pressure seals.',
        safeWindowMins: 15,
        criticalHazardWarning: 'High priority urgency: Less than 15 minutes remaining on safe handover timer!',
      },
    },
    {
      id: 'rescue-3',
      foodItem: '3kg Dal Khichdi',
      quantity: '3kg (~8 portions)',
      weightInKg: 3,
      providerName: 'Samruddhi Caterers',
      providerLocation: 'Kitchen Dispatch Cell 4, SV Road',
      dietaryType: 'Veg',
      packagingType: 'Foil Packed Containers',
      initialExpiryMinutes: 45,
      createdAt: now - 5 * 60 * 1000,
      expiresAt: now + 45 * 60 * 1000,
      status: 'available',
      destinationNode: 'Railway Transit Labor Mess Night Wing',
      safetyTip: {
        headline: 'Lentil & Grain Blend: Stable heat retention profile.',
        transitInstruction: 'Hot-hold container verified; maintain temp > 60°C during 20-min transit.',
        tempRequirement: 'Maintain > 60°C or re-heat to boiling before serving.',
        packagingSuitability: 'Heavy-gauge aluminum foil containers with cardboard press lids.',
        safeWindowMins: 45,
        criticalHazardWarning: 'Verify tamper seal before dispensing to children or seniors.',
      },
    },
    {
      id: 'rescue-4',
      foodItem: '6kg Fresh Fruit Salad & Melons',
      quantity: '6kg (~15 portions)',
      weightInKg: 6,
      providerName: 'Metro Club Dining Hall',
      providerLocation: 'North Wing Buffet Clearance Counter',
      dietaryType: 'Vegan',
      packagingType: 'Chilled Produce Trays with Ice Packs',
      initialExpiryMinutes: 18,
      createdAt: now - 4 * 60 * 1000,
      expiresAt: now + 18 * 60 * 1000,
      status: 'available',
      destinationNode: 'St. Jude Children Haven Center',
      safetyTip: {
        headline: 'Cold Perishable Protocol: Chilled melon moisture barrier.',
        transitInstruction: 'Keep chilled with ice pack lining; deliver directly to shelter refrigeration.',
        tempRequirement: 'Must remain cold < 7°C to preserve vitamin and prevent enzyme breakdown.',
        packagingSuitability: 'Clear PET food containers nested inside thermal cool-bags.',
        safeWindowMins: 18,
        criticalHazardWarning: 'High urgency cold item: Do not expose to outdoor sunlight or vehicle ambient heat.',
      },
    },
    {
      id: 'rescue-5',
      foodItem: '10kg Chapati & Mixed Subzi',
      quantity: '10kg (~28 portions)',
      weightInKg: 10,
      providerName: 'Community Kitchen Hub',
      providerLocation: 'Main Floor Dispatch Center',
      dietaryType: 'Veg',
      packagingType: 'Food-Grade Stainless Casseroles',
      initialExpiryMinutes: 55,
      createdAt: now - 1 * 60 * 1000,
      expiresAt: now + 55 * 60 * 1000,
      status: 'available',
      destinationNode: 'Anand Shelter Home (Capacity: 80)',
      safetyTip: {
        headline: 'Bread & Cooked Vegetable Integrity: Dual-zone compartmental packaging.',
        transitInstruction: 'Chapatis wrapped in parchment; subzi held in insulated thermos container.',
        tempRequirement: 'Chapatis ambient dry; Subzi > 60°C hot hold.',
        packagingSuitability: 'Multi-tier stainless steel carriers with positive locking clamps.',
        safeWindowMins: 55,
        criticalHazardWarning: 'Keep breads ventilated to avoid moisture buildup and rapid texture degradation.',
      },
    },
  ];
}

export const INITIAL_TOP_RESCUERS: UserProfile[] = [
  {
    uid: 'res-vol-1',
    displayName: 'Aarav Sharma',
    email: 'aarav.s@civicrescue.org',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    rescuesCount: 19,
    broadcastsCount: 3,
    totalKgRescued: 98,
    mealsSaved: 245,
    fastestClaimMinutes: 5,
    earnedBadges: ['first-rescue', 'speed-demon', 'community-anchor', 'zero-waste-hero'],
    createdAt: Date.now() - 32 * 86400000,
    lastActiveAt: Date.now() - 15 * 60 * 1000,
    cheersCount: 42,
  },
  {
    uid: 'res-vol-2',
    displayName: 'Priya Desai',
    email: 'priya.d@foodbridge.net',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rescuesCount: 14,
    broadcastsCount: 2,
    totalKgRescued: 74,
    mealsSaved: 185,
    fastestClaimMinutes: 7,
    earnedBadges: ['first-rescue', 'speed-demon', 'community-anchor', 'zero-waste-hero'],
    createdAt: Date.now() - 25 * 86400000,
    lastActiveAt: Date.now() - 45 * 60 * 1000,
    cheersCount: 31,
  },
  {
    uid: 'res-vol-3',
    displayName: 'Marcus Chen',
    email: 'marcus.chen@bayrescue.org',
    photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    rescuesCount: 9,
    broadcastsCount: 8,
    totalKgRescued: 46,
    mealsSaved: 115,
    fastestClaimMinutes: 9,
    earnedBadges: ['first-rescue', 'speed-demon', 'community-anchor'],
    createdAt: Date.now() - 18 * 86400000,
    lastActiveAt: Date.now() - 2 * 3600 * 1000,
    cheersCount: 23,
  },
  {
    uid: 'res-vol-4',
    displayName: 'Elena Rostova',
    email: 'elena.r@shelteraid.org',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    rescuesCount: 6,
    broadcastsCount: 1,
    totalKgRescued: 34,
    mealsSaved: 85,
    fastestClaimMinutes: 8,
    earnedBadges: ['first-rescue', 'speed-demon', 'community-anchor'],
    createdAt: Date.now() - 12 * 86400000,
    lastActiveAt: Date.now() - 5 * 3600 * 1000,
    cheersCount: 17,
  },
  {
    uid: 'res-vol-5',
    displayName: 'Devon Miller',
    email: 'devon.m@transitrelief.org',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rescuesCount: 3,
    broadcastsCount: 0,
    totalKgRescued: 18,
    mealsSaved: 45,
    fastestClaimMinutes: 14,
    earnedBadges: ['first-rescue', 'community-anchor'],
    createdAt: Date.now() - 7 * 86400000,
    lastActiveAt: Date.now() - 8 * 3600 * 1000,
    cheersCount: 11,
  },
];
