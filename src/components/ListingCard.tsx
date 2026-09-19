import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  AlertCircle,
  Package,
  RotateCcw,
  Check,
  Radio,
  QrCode,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SurplusListing } from '../types';
import { RescueLogisticsChat } from './RescueLogisticsChat';

interface ListingCardProps {
  listing: SurplusListing;
  currentTime: number; // passed down for synchronized per-second re-renders
  onOpenSafetyModal: (listing: SurplusListing) => void;
  onOpenClaimModal: (listing: SurplusListing) => void;
  onOpenQRModal: (listing: SurplusListing) => void;
  onOpenVerificationModal: (listing: SurplusListing) => void;
  onUpdateStatus: (listingId: string, nextStatus: 'available' | 'claimed' | 'completed') => void;
  isAccessibilityMode?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  currentTime,
  onOpenSafetyModal,
  onOpenClaimModal,
  onOpenQRModal,
  onOpenVerificationModal,
  onUpdateStatus,
  isAccessibilityMode = false,
}) => {
  const {
    id,
    foodItem,
    quantity,
    weightInKg,
    providerName,
    providerLocation,
    dietaryType,
    packagingType,
    expiresAt,
    status,
    destinationNode,
    claimedBy,
  } = listing;

  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const totalRemainingSeconds = Math.max(0, Math.floor((expiresAt - currentTime) / 1000));
  const isExpired = totalRemainingSeconds <= 0 && status !== 'completed';
  const remainingMins = Math.floor(totalRemainingSeconds / 60);
  const remainingSecs = totalRemainingSeconds % 60;

  // Urgency threshold: Under 20 minutes triggers amber/red glow!
  const isUrgent = remainingMins < 20 && status === 'available';
  const isCritical = remainingMins < 10 && status === 'available';

  // Format time string: MM:SS
  const formattedCountdown = `${remainingMins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  return (
    <div
      id={`listing-card-${id}`}
      className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-300 border flex flex-col justify-between ${
        isAccessibilityMode
          ? status === 'completed'
            ? 'bg-black border-2 border-slate-500 text-white'
            : status === 'claimed'
            ? 'bg-black border-2 border-sky-400 text-white ring-2 ring-sky-400/30'
            : isCritical
            ? 'bg-black border-2 border-rose-500 text-white ring-2 ring-rose-500/50'
            : isUrgent
            ? 'bg-black border-2 border-amber-400 text-white ring-2 ring-amber-400/50'
            : 'bg-black border-2 border-emerald-400 text-white shadow-lg'
          : status === 'completed'
          ? 'bg-slate-900/60 border-slate-800 opacity-80'
          : status === 'claimed'
          ? 'bg-slate-850/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
          : isCritical
          ? 'bg-slate-900 border-rose-500 shadow-xl shadow-rose-500/20 ring-1 ring-rose-500/50'
          : isUrgent
          ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/40'
          : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 shadow-md'
      }`}
    >
      {/* Top Row: Dietary Pill & Live Status Badge & Expiry Countdown */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {status === 'available' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                isAccessibilityMode
                  ? 'bg-sky-400 text-black border-2 border-sky-300 font-extrabold'
                  : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAccessibilityMode ? 'bg-black' : 'bg-sky-400'}`}></span>
                Available for Rescue
              </span>
            )}

            {status === 'claimed' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                isAccessibilityMode
                  ? 'bg-emerald-400 text-black border-2 border-emerald-300 font-extrabold'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAccessibilityMode ? 'bg-black' : 'bg-emerald-400'}`}></span>
                Claimed • In Transit
              </span>
            )}

            {status === 'completed' && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isAccessibilityMode
                  ? 'bg-white text-black border-2 border-slate-400 font-extrabold'
                  : 'bg-slate-800 text-emerald-400 border border-emerald-700/40'
              }`}>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Rescued & Delivered
              </span>
            )}

            {/* Dietary Pill */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                dietaryType === 'Veg'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                  : dietaryType === 'Vegan'
                  ? 'bg-teal-950/60 text-teal-300 border-teal-800/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {dietaryType === 'Veg' && '🌱 Veg'}
              {dietaryType === 'Vegan' && '🌿 Vegan'}
              {dietaryType === 'Dairy' && '🥛 Dairy'}
              {dietaryType === 'Bakery' && '🍞 Bakery'}
            </span>
          </div>

          {/* Live Ticking Countdown Timer Badge */}
          {status !== 'completed' && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold tracking-tight border ${
                isCritical
                  ? 'bg-rose-950/80 text-rose-200 border-rose-500/60 animate-bounce'
                  : isUrgent
                  ? 'bg-amber-950/80 text-amber-200 border-amber-500/60'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700'
              }`}
              title="Time remaining before food safety window expires"
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  isCritical ? 'text-rose-400 animate-spin' : isUrgent ? 'text-amber-400' : 'text-slate-400'
                }`}
              />
              <span>{isExpired ? 'EXPIRED' : `${formattedCountdown} remaining`}</span>
            </div>
          )}

          {status === 'completed' && (
            <div className="text-[11px] font-mono font-semibold text-emerald-400/90 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              +{Math.round(weightInKg * 2.5)} Meals Logged
            </div>
          )}
        </div>

        {/* Food Item Title & Quantity */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {foodItem}
            </h3>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 shrink-0">
              {quantity}
            </span>
          </div>

          {/* Provider and Location */}
          <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{providerName}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {providerLocation}
            </span>
          </div>
        </div>

        {/* Packaging info & Destination info */}
        <div className="my-3 space-y-1.5 text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Packaging: <strong className="text-slate-200">{packagingType}</strong></span>
          </div>

          {destinationNode && (
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Route Node: <strong className="text-sky-300">{destinationNode}</strong></span>
            </div>
          )}

          {claimedBy && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Assigned to: <strong className="text-slate-200">{claimedBy}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 mt-2">
        {/* AI Quick Triage Button */}
        <button
          onClick={() => onOpenSafetyModal(listing)}
          id={`verify-safety-btn-${id}`}
          className={`inline-flex items-center gap-1.5 rounded-xl transition-all cursor-pointer ${
            isAccessibilityMode
              ? 'min-h-[44px] px-4 py-2.5 text-sm font-bold bg-black text-emerald-300 border-2 border-emerald-400 hover:bg-emerald-950/60 shadow-sm'
              : 'px-3 py-2 text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/40 hover:border-emerald-500/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verify Safety / Packaging AI Tip</span>
        </button>

        {/* Primary State Transition Machine Controls */}
        <div className="flex items-center gap-2">
          {status === 'available' && (
            <>
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
                id={`toggle-chat-btn-${id}`}
                title="Open dispatch logistics notes & chat drawer"
                className={`rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isAccessibilityMode
                    ? isChatDrawerOpen
                      ? 'min-h-[44px] min-w-[44px] bg-sky-400 text-black border-2 border-sky-300'
                      : 'min-h-[44px] min-w-[44px] bg-black text-white border-2 border-slate-500 hover:border-sky-400 hover:text-sky-300'
                    : isChatDrawerOpen
                    ? 'p-2 bg-sky-950 border-sky-500 text-sky-300'
                    : 'p-2 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-sky-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenQRModal(listing)}
                id={`qr-code-btn-${id}`}
                title="Scan or generate QR Code for Google Maps Transit Route"
                className={`inline-flex items-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isAccessibilityMode
                    ? 'min-h-[44px] px-4 py-2.5 text-sm font-bold bg-sky-400 hover:bg-sky-300 text-black border-2 border-sky-300'
                    : 'px-3 py-2 text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-600/40 hover:border-sky-400/60'
                }`}
              >
                <QrCode className={`w-4 h-4 ${isAccessibilityMode ? 'text-black' : 'text-sky-400'}`} />
                <span>Transit QR</span>
              </button>

              <button
                onClick={() => onOpenClaimModal(listing)}
                id={`claim-route-btn-${id}`}
                disabled={isExpired}
                className={`rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                  isAccessibilityMode
                    ? isExpired
                      ? 'min-h-[44px] px-5 py-2.5 text-sm font-bold bg-slate-800 text-slate-400 border-2 border-slate-600 cursor-not-allowed'
                      : 'min-h-[44px] px-5 py-2.5 text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-black border-2 border-amber-300 ring-2 ring-amber-400 shadow-amber-400/20'
                    : isExpired
                    ? 'px-4 py-2 text-xs font-bold bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : isUrgent
                    ? 'px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-amber-500/25 animate-pulse font-extrabold'
                    : 'px-4 py-2 text-xs font-bold bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 shadow-sky-500/20'
                }`}
              >
                <span>Claim & Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {status === 'claimed' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
                id={`toggle-claimed-chat-btn-${id}`}
                title="Open dispatch coordination notes and chat drawer"
                className={`rounded-xl font-bold border flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  isAccessibilityMode
                    ? isChatDrawerOpen
                      ? 'min-h-[44px] px-4 py-2.5 text-sm bg-sky-400 text-black border-2 border-sky-300'
                      : 'min-h-[44px] px-4 py-2.5 text-sm bg-black text-white border-2 border-slate-500 hover:border-sky-400'
                    : isChatDrawerOpen
                    ? 'px-3 py-2 text-xs bg-sky-950 border-sky-500 text-sky-300'
                    : 'px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <MessageSquare className={`w-4 h-4 ${isAccessibilityMode && isChatDrawerOpen ? 'text-black' : 'text-sky-400'}`} />
                <span>Chat Drawer</span>
                {isChatDrawerOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => onOpenVerificationModal(listing)}
                id={`open-verification-qr-btn-${id}`}
                title="Open scannable QR verification badge and confirm handover"
                className={`rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  isAccessibilityMode
                    ? 'min-h-[44px] px-4 py-2.5 text-sm bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-emerald-300'
                    : 'px-3 py-2 text-xs bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${isAccessibilityMode ? 'text-black' : 'text-emerald-400'}`} />
                <span>QR Verification</span>
              </button>

              <button
                onClick={() => onUpdateStatus(id, 'available')}
                title="Cancel claim and release back to available pool"
                className={`rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                  isAccessibilityMode
                    ? 'min-h-[44px] min-w-[44px] bg-black text-white border-2 border-slate-500 hover:border-rose-400 hover:text-rose-400'
                    : 'p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => onUpdateStatus(id, 'completed')}
                id={`complete-delivery-btn-${id}`}
                className={`rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                  isAccessibilityMode
                    ? 'min-h-[44px] px-4 py-2.5 text-sm bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-emerald-300'
                    : 'px-3.5 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isAccessibilityMode ? 'text-black' : 'text-white'}`} />
                <span>Mark Delivered</span>
              </button>
            </div>
          )}

          {status === 'completed' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
                id={`toggle-completed-chat-btn-${id}`}
                title="View completed rescue message log"
                className={`rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  isAccessibilityMode
                    ? isChatDrawerOpen
                      ? 'min-h-[44px] min-w-[44px] bg-sky-400 text-black border-2 border-sky-300'
                      : 'min-h-[44px] min-w-[44px] bg-black text-white border-2 border-slate-500'
                    : isChatDrawerOpen
                    ? 'p-2 bg-sky-950 border-sky-500 text-sky-300'
                    : 'p-2 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenVerificationModal(listing)}
                id={`view-verification-btn-${id}`}
                title="View verified QR handover certificate"
                className={`rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  isAccessibilityMode
                    ? 'min-h-[44px] px-3.5 py-2 text-xs font-bold bg-black text-emerald-300 border-2 border-emerald-400 hover:bg-emerald-950'
                    : 'px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Handover</span>
              </button>

              <button
                onClick={() => onUpdateStatus(id, 'available')}
                className={`cursor-pointer underline ${
                  isAccessibilityMode
                    ? 'min-h-[44px] px-2 flex items-center text-xs font-bold text-amber-300 hover:text-white'
                    : 'text-[11px] text-slate-500 hover:text-slate-300'
                }`}
              >
                Reopen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightweight Collapsible Rescue Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="mt-3 pt-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          <RescueLogisticsChat
            listing={listing}
            compact={true}
            defaultRole={status === 'claimed' ? 'volunteer' : 'provider'}
            title="Rescue Chat & Dispatch Log"
            subtitle="Live status notes, dock instructions, and timing updates via Firestore"
          />
        </div>
      )}
    </div>
  );
};
