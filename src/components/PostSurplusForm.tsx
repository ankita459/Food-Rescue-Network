import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  Sparkles,
  MapPin,
  Package,
  ShieldCheck,
  Check,
  Compass,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DietaryType, SurplusListing } from '../types';
import { generateSmartSafetyTip, RESCUE_DESTINATION_NODES } from '../data/seedData';
import { requestGoogleMapsGrounding, MapsGroundingResponse } from '../lib/mapsGrounding';

interface PostSurplusFormProps {
  onAddListing: (listing: SurplusListing) => void;
  currentUserId?: string;
  currentUserName?: string;
}

const PRESET_TEMPLATES = [
  {
    foodItem: 'Paneer Butter Masala & Jeera Rice',
    quantity: '7kg (~16 portions)',
    weightInKg: 7,
    providerName: 'Taj Banquets & Dining',
    providerLocation: 'Service Dock 3, Ring Road, San Francisco',
    dietaryType: 'Veg' as DietaryType,
    packagingType: 'Insulated Hot-Box',
    expiryMinutes: 25,
  },
  {
    foodItem: 'Assorted Steamed Momos & Veg Noodles',
    quantity: '4kg (~10 portions)',
    weightInKg: 4,
    providerName: 'Orient Express Kitchen',
    providerLocation: 'Delivery Bay A, Metro Mall, San Francisco',
    dietaryType: 'Vegan' as DietaryType,
    packagingType: 'Thermal Sealed Cans',
    expiryMinutes: 20,
  },
  {
    foodItem: 'Fresh Cut Seasonal Fruit Salad',
    quantity: '5kg (~14 portions)',
    weightInKg: 5,
    providerName: 'Green Earth Salad Bar',
    providerLocation: 'Ground Floor Dispatch Counter, Mission St',
    dietaryType: 'Vegan' as DietaryType,
    packagingType: 'Chilled Trays with Ice Packs',
    expiryMinutes: 35,
  },
  {
    foodItem: 'Whole Wheat Roti & Mixed Veg Curry',
    quantity: '9kg (~22 portions)',
    weightInKg: 9,
    providerName: 'Annam Community Canteen',
    providerLocation: 'East Gate Loading Platform, 4th St',
    dietaryType: 'Veg' as DietaryType,
    packagingType: 'Foil Packed Containers',
    expiryMinutes: 50,
  },
];

export const PostSurplusForm: React.FC<PostSurplusFormProps> = ({
  onAddListing,
  currentUserId,
  currentUserName,
}) => {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerLocation, setProviderLocation] = useState('');
  const [dietaryType, setDietaryType] = useState<DietaryType>('Veg');
  const [packagingType, setPackagingType] = useState('Insulated Hot-Box');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [successToast, setSuccessToast] = useState(false);

  // Google Maps Grounding address verification states
  const [verifyingAddress, setVerifyingAddress] = useState(false);
  const [addressIntel, setAddressIntel] = useState<MapsGroundingResponse | null>(null);
  const [addressVerifyError, setAddressVerifyError] = useState<string | null>(null);
  const [selectedDestinationNode, setSelectedDestinationNode] = useState<string>('');

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setFoodItem(preset.foodItem);
    setQuantity(preset.quantity);
    setProviderName(preset.providerName);
    setProviderLocation(preset.providerLocation);
    setDietaryType(preset.dietaryType);
    setPackagingType(preset.packagingType);
    setExpiryMinutes(preset.expiryMinutes);
    setAddressIntel(null);
  };

  const handleVerifyWithGoogleMaps = async () => {
    const locToVerify = providerLocation.trim() || providerName.trim();
    if (!locToVerify) {
      setAddressVerifyError('Please enter a provider name or pickup location to verify on Google Maps.');
      return;
    }

    setVerifyingAddress(true);
    setAddressVerifyError(null);
    try {
      const data = await requestGoogleMapsGrounding({
        queryType: 'verify_address',
        location: locToVerify,
        foodItem: foodItem || 'surplus meals',
      });
      setAddressIntel(data);
    } catch (err: any) {
      setAddressVerifyError(err?.message || 'Failed to verify address with Google Maps');
    } finally {
      setVerifyingAddress(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItem.trim() || !providerName.trim() || !quantity.trim()) return;

    // Estimate weight in kg from text or fallback to 5kg
    const parsedKg = parseFloat(quantity.replace(/[^0-9.]/g, '')) || 5;

    const now = Date.now();
    const safetyTip = generateSmartSafetyTip(
      foodItem,
      dietaryType,
      packagingType,
      expiryMinutes
    );

    // Pick recommended nearby shelter node
    const fallbackDestination =
      RESCUE_DESTINATION_NODES[Math.floor(Math.random() * RESCUE_DESTINATION_NODES.length)].name;

    const newListing: SurplusListing = {
      id: `rescue-${Date.now()}`,
      foodItem: foodItem.trim(),
      quantity: quantity.trim(),
      weightInKg: Math.max(1, parsedKg),
      providerName: providerName.trim(),
      providerLocation: providerLocation.trim() || 'Central Kitchen Dispatch Bay',
      dietaryType,
      packagingType,
      initialExpiryMinutes: expiryMinutes,
      createdAt: now,
      expiresAt: now + expiryMinutes * 60 * 1000,
      status: 'available',
      safetyTip,
      destinationNode: selectedDestinationNode || fallbackDestination,
      claimedBy: undefined,
    };

    onAddListing(newListing);

    // Reset form
    setFoodItem('');
    setQuantity('');
    setProviderName('');
    setProviderLocation('');
    setExpiryMinutes(30);
    setAddressIntel(null);
    setSelectedDestinationNode('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Broadcast Surplus Batch</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Register surplus food for immediate community redistribution
          </p>
        </div>

        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>FSSAI / HACCP Compliant</span>
        </span>
      </div>

      {/* Quick Presets */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick One-Tap Commercial Kitchen Templates:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_TEMPLATES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-xs group cursor-pointer"
            >
              <div className="font-semibold text-slate-200 group-hover:text-emerald-400 truncate">
                {preset.foodItem}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{preset.quantity}</span>
                <span className="font-mono text-amber-400/90">{preset.expiryMinutes}m</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Elements */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Item Name */}
        <div>
          <label htmlFor="food-item-input" className="block text-xs font-semibold text-slate-300 mb-1">
            Food Item / Prepared Dish Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="food-item-input"
            type="text"
            required
            placeholder="e.g. Mixed Veg Biryani, Bread Loaves, Dal Fry"
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors outline-none"
          />
        </div>

        {/* 2-Column: Quantity & Provider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quantity */}
          <div>
            <label htmlFor="quantity-input" className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity / Approximate Weight <span className="text-rose-400">*</span>
            </label>
            <input
              id="quantity-input"
              type="text"
              required
              placeholder="e.g. 5kg, 20 portions, 3 trays"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors outline-none"
            />
          </div>

          {/* Source / Provider Name */}
          <div>
            <label htmlFor="provider-name-input" className="block text-xs font-semibold text-slate-300 mb-1">
              Source / Provider Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="provider-name-input"
              type="text"
              required
              placeholder="e.g. Hotel Grand, Campus Mess"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors outline-none"
            />
          </div>
        </div>

        {/* Pickup Landmark & Google Maps Grounding Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="provider-location-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              Pickup Gate / Address
            </label>
            <button
              type="button"
              onClick={handleVerifyWithGoogleMaps}
              disabled={verifyingAddress}
              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {verifyingAddress ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Grounding via Maps...</span>
                </>
              ) : (
                <>
                  <Compass className="w-2.5 h-2.5" />
                  <span>Verify with Google Maps</span>
                </>
              )}
            </button>
          </div>
          <input
            id="provider-location-input"
            type="text"
            placeholder="e.g. Back Gate Kitchen Bay 2, 450 Valencia St, San Francisco"
            value={providerLocation}
            onChange={(e) => setProviderLocation(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors outline-none"
          />

          {addressVerifyError && (
            <p className="text-[11px] text-rose-400 mt-1">{addressVerifyError}</p>
          )}

          {/* Google Maps Grounded Address Intelligence Display */}
          {addressIntel && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-xs text-slate-300 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span>✓ Google Maps Verified Intelligence (gemini-3.5-flash)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAddressIntel(null)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <div className="text-[11px] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto pr-1">
                {addressIntel.text}
              </div>

              {addressIntel.groundingMetadata?.groundingChunks && addressIntel.groundingMetadata.groundingChunks.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Nearby Recommended Food Rescue Nodes:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {addressIntel.groundingMetadata.groundingChunks.map((chunk, i) => {
                      const place = chunk.places;
                      if (!place?.name) return null;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDestinationNode(place.name || '')}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                            selectedDestinationNode === place.name
                              ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                              : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <span>{place.name}</span>
                          {selectedDestinationNode === place.name ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dietary Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Dietary Classification
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Veg', 'Vegan', 'Dairy', 'Bakery'] as DietaryType[]).map((type) => {
              const isSelected = dietaryType === type;
              return (
                <button
                  key={type}
                  type="button"
                  id={`dietary-type-${type.toLowerCase()}`}
                  onClick={() => setDietaryType(type)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {type === 'Veg' && '🌱 Pure Veg'}
                  {type === 'Vegan' && '🌿 100% Vegan'}
                  {type === 'Dairy' && '🥛 Dairy'}
                  {type === 'Bakery' && '🍞 Bakery'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Packaging Type */}
        <div>
          <label htmlFor="packaging-select" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            Packaging Verified
          </label>
          <select
            id="packaging-select"
            value={packagingType}
            onChange={(e) => setPackagingType(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 transition-colors outline-none cursor-pointer"
          >
            <option value="Insulated Hot-Box">Insulated Hot-Box (Thermal retention &gt; 60°C)</option>
            <option value="Thermal Sealed Cans">Thermal Sealed Stainless Steel Cans</option>
            <option value="Foil Packed Containers">Food-grade Sealed Foil Trays</option>
            <option value="Chilled Trays with Ice Packs">Chilled Trays with Ice Packs (&lt; 8°C)</option>
            <option value="Covered Stainless Casseroles">Covered Stainless Casseroles</option>
          </select>
        </div>

        {/* Expiry Countdown (Minutes) with Quick Presets */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="expiry-range-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Expiry Countdown Window:
            </label>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
                expiryMinutes <= 20
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : expiryMinutes <= 35
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {expiryMinutes} mins remaining
            </span>
          </div>

          <input
            id="expiry-range-slider"
            type="range"
            min="10"
            max="90"
            step="5"
            value={expiryMinutes}
            onChange={(e) => setExpiryMinutes(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
            <span>10m (Emergency)</span>
            <div className="flex gap-1.5">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setExpiryMinutes(mins)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                    expiryMinutes === mins
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <span>90m</span>
          </div>

          {expiryMinutes <= 20 && (
            <div className="mt-2 text-[11px] text-rose-300/90 flex items-center gap-1 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Under 20 mins: Will broadcast with Urgent Amber/Red Alert on live radar!
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submit-surplus-btn"
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Broadcast to Live Rescue Radar
        </button>
      </form>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Surplus batch registered and broadcast to regional rescue nodes successfully!</span>
        </div>
      )}
    </div>
  );
};
