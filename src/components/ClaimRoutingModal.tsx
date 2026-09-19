import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  CheckCircle,
  Building,
  UserCheck,
  X,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  QrCode
} from 'lucide-react';
import { SurplusListing } from '../types';
import { RESCUE_DESTINATION_NODES } from '../data/seedData';
import { requestGoogleMapsGrounding, MapsGroundingResponse } from '../lib/mapsGrounding';
import { RescueLogisticsChat } from './RescueLogisticsChat';

interface ClaimRoutingModalProps {
  listing: SurplusListing | null;
  onConfirmClaim: (listingId: string, nodeName: string, volunteerName: string) => void;
  onClose: () => void;
  onOpenQRModal?: (listing: SurplusListing) => void;
}

export const ClaimRoutingModal: React.FC<ClaimRoutingModalProps> = ({
  listing,
  onConfirmClaim,
  onClose,
  onOpenQRModal,
}) => {
  const [selectedNode, setSelectedNode] = useState(
    listing?.destinationNode || RESCUE_DESTINATION_NODES[0].name
  );
  const [volunteerName, setVolunteerName] = useState('Volunteer Node #104 (Van Dispatch)');
  const [routeIntel, setRouteIntel] = useState<MapsGroundingResponse | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [showIntelSection, setShowIntelSection] = useState(false);

  if (!listing) return null;

  const { foodItem, quantity, providerName, providerLocation, expiresAt } = listing;
  const remainingSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const remainingMins = Math.floor(remainingSeconds / 60);

  const matchedNode = RESCUE_DESTINATION_NODES.find((n) => n.name === selectedNode) || RESCUE_DESTINATION_NODES[0];
  const travelTime = matchedNode.travelTimeMin;
  const bufferMargin = remainingMins - travelTime;

  const handleFetchRouteIntel = async () => {
    setLoadingIntel(true);
    setIntelError(null);
    setShowIntelSection(true);
    try {
      const data = await requestGoogleMapsGrounding({
        queryType: 'route_intel',
        location: `${providerName}, ${providerLocation}`,
        destination: selectedNode,
        foodItem,
        quantity,
      });
      setRouteIntel(data);
    } catch (err: any) {
      setIntelError(err?.message || 'Failed to retrieve Google Maps transit intel');
    } finally {
      setLoadingIntel(false);
    }
  };

  const handleClaim = () => {
    onConfirmClaim(listing.id, selectedNode, volunteerName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Claim & Route Food Rescue
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/30 text-sky-300">
                  Google Maps Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lock batch reservation and calculate live transit corridors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Rescue Batch Details Summary */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Selected Surplus Payload
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-bold text-white">{foodItem}</div>
              <div className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {quantity}
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                <strong>{providerName}</strong> — {providerLocation}
              </span>
            </div>
          </div>

          {/* Transit Time Window Analysis */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">
                  Safe Expiry Window
                </div>
                <div className="text-xs text-slate-400">
                  Estimated Transit Time: <strong className="text-sky-300">{travelTime} mins</strong>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-mono font-bold text-amber-300">
                {remainingMins}m remaining
              </div>
              <div className={`text-[11px] font-semibold ${bufferMargin > 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {bufferMargin > 5 ? `✓ +${bufferMargin}m Safety Buffer` : `⚠️ Tight Buffer (${bufferMargin}m)`}
              </div>
            </div>
          </div>

          {/* Destination Shelter Node Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                Select Target Recipient / Community Kitchen Node:
              </label>
            </div>
            <div className="space-y-2">
              {RESCUE_DESTINATION_NODES.map((node) => {
                const isSelected = selectedNode === node.name;
                return (
                  <button
                    key={node.name}
                    type="button"
                    onClick={() => {
                      setSelectedNode(node.name);
                      setRouteIntel(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500 text-white shadow-sm shadow-sky-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <span className="font-semibold">{node.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{node.distance}</span>
                      <span>•</span>
                      <span className="text-sky-300">ETA {node.travelTimeMin}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Maps Live Route Grounding Tool */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-sky-200">
                  Google Maps Transit Route Intelligence
                </span>
              </div>
              <button
                type="button"
                onClick={handleFetchRouteIntel}
                disabled={loadingIntel}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingIntel ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Querying Maps via gemini-3.5-flash...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" />
                    <span>{routeIntel ? 'Refresh Route Intel' : 'Analyze Route with Google Maps'}</span>
                  </>
                )}
              </button>
            </div>

            {intelError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900">
                {intelError}
              </p>
            )}

            {showIntelSection && routeIntel && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span>✓ Grounded via gemini-3.5-flash (googleMaps tool)</span>
                </div>
                <div className="text-[11px] leading-relaxed whitespace-pre-wrap">
                  {routeIntel.text}
                </div>

                {routeIntel.groundingMetadata?.groundingChunks && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
                    {routeIntel.groundingMetadata.groundingChunks.map((chunk, i) => {
                      const place = chunk.places;
                      const uri = place?.websiteUri || chunk.web?.uri;
                      if (!uri) return null;
                      return (
                        <a
                          key={i}
                          href={uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          <span>{place?.name || 'View on Google Maps'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Volunteer / Courier Identifier */}
          <div>
            <label htmlFor="volunteer-name-input" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Claiming Volunteer / Rapid Team Tag
            </label>
            <input
              id="volunteer-name-input"
              type="text"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
            />
          </div>

          {/* Real-time Handover Logistics Messaging Component (Firebase Firestore) */}
          <div>
            <RescueLogisticsChat
              listing={listing}
              compact={false}
              defaultRole="volunteer"
              title="Handover Logistics & Timing Coordinator"
              subtitle="Coordinate dock codes, ETA, and packaging in real-time via Firestore"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2.5">
          {onOpenQRModal && (
            <button
              type="button"
              onClick={() => onOpenQRModal(listing)}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Show Mobile Transit QR</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleClaim}
              id="confirm-claim-button"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Lock Claim & Start Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
