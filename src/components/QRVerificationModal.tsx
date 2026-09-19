import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  X,
  MapPin,
  Building2,
  Clock,
  UserCheck,
  QrCode,
  Sparkles,
  ExternalLink,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { SurplusListing } from '../types';

interface QRVerificationModalProps {
  listing: SurplusListing | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmHandover: (listingId: string) => void;
}

export const QRVerificationModal: React.FC<QRVerificationModalProps> = ({
  listing,
  isOpen,
  onClose,
  onConfirmHandover,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  if (!isOpen || !listing) return null;

  const isCompleted = listing.status === 'completed';
  const token = listing.claimToken || `CLAIM-${listing.id.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Verification payload encoded inside the scannable QR code
  const verificationPayload = JSON.stringify({
    type: 'FRN_RESCUE_HANDOVER_VERIFICATION',
    token: token,
    listingId: listing.id,
    foodItem: listing.foodItem,
    quantity: listing.quantity,
    weightKg: listing.weightInKg,
    provider: listing.providerName,
    pickupLocation: listing.providerLocation,
    recipientNode: listing.destinationNode || 'Nearest Emergency Shelter Node',
    claimedBy: listing.claimedBy || 'Volunteer Rapid Team',
    claimedAt: listing.claimedAt ? new Date(listing.claimedAt).toISOString() : new Date().toISOString(),
    status: listing.status,
  });

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    } catch (e) {
      console.warn('Failed to copy token:', e);
    }
  };

  const handleHandoverClick = () => {
    setConfirming(true);
    onConfirmHandover(listing.id);
    setConfirmedSuccess(true);
    setTimeout(() => {
      setConfirming(false);
      onClose();
    }, 1800);
  };

  const estimatedMeals = Math.round(listing.weightInKg * 2.5);
  const estimatedCo2 = Math.round(listing.weightInKg * 2.0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div
        className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-verification-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="qr-verification-title" className="text-base font-bold text-white">
                  Rescue QR Verification
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
                  Handover Badge
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Present this digital badge to the recipient shelter coordinator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-qr-verification-modal-btn"
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Handover Success Banner if just confirmed */}
          {confirmedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 flex items-center gap-2.5 animate-in zoom-in-95">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">Handover Confirmed & Rescue Finalized!</div>
                <div className="text-emerald-300">
                  +{estimatedMeals} Meals logged & +{estimatedCo2}kg CO₂ diverted to community impact.
                </div>
              </div>
            </div>
          )}

          {/* Unique Claim Token Display Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Unique Claim Verification Token</span>
              </div>
              <div className="text-sm sm:text-base font-mono font-extrabold text-emerald-300 tracking-wider mt-0.5 select-all truncate">
                {token}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyToken}
              id="copy-claim-token-btn"
              title="Copy verification token"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {copiedToken ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-300 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Copy Token</span>
                </>
              )}
            </button>
          </div>

          {/* Scannable QR Code presentation */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center border-4 border-emerald-500/20">
              <QRCodeSVG
                value={verificationPayload}
                size={190}
                level="H"
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#022c22"
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-300">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scannable Handover Verification QR</span>
            </div>
            <p className="text-[11px] text-slate-400 text-center max-w-xs mt-0.5">
              Receiving shelter or volunteer scans this QR code to verify batch authenticity and chain of custody.
            </p>
          </div>

          {/* Payload & Transit Overview */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white truncate max-w-[200px]">
                  {listing.foodItem}
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                {listing.quantity}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Donor Origin:</span>
                <span className="text-white font-medium">{listing.providerName}</span>
                <span className="text-slate-400 block truncate">{listing.providerLocation}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Destination Node:</span>
                <span className="text-sky-300 font-medium">{listing.destinationNode || 'Community Shelter'}</span>
                <span className="text-slate-400 block">Volunteer: {listing.claimedBy || 'Rapid Courier'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span>Expected Impact:</span>
              <span className="text-emerald-300 font-semibold font-mono">
                ~{estimatedMeals} Meals Saved • ~{estimatedCo2}kg CO₂ Diverted
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isCompleted ? 'Close' : 'Keep In Transit'}
          </button>

          {!isCompleted ? (
            <button
              type="button"
              onClick={handleHandoverClick}
              disabled={confirming || confirmedSuccess}
              id="confirm-handover-action-btn"
              className="flex-1 max-w-xs py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-white" />
              <span>{confirming ? 'Finalizing Handover...' : 'Confirm Handover & Finalize Rescue'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
              <Check className="w-4 h-4" />
              <span>Handover Completed & Verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
