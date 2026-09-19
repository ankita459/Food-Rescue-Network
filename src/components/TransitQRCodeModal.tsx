import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  X,
  Building2,
  Share2,
  Bus,
  Car,
  Bike,
  Footprints,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { SurplusListing } from '../types';
import { RESCUE_DESTINATION_NODES } from '../data/seedData';

interface TransitQRCodeModalProps {
  listing: SurplusListing | null;
  isOpen: boolean;
  onClose: () => void;
}

type TravelMode = 'transit' | 'driving' | 'bicycling' | 'walking';

export const TransitQRCodeModal: React.FC<TransitQRCodeModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [travelMode, setTravelMode] = useState<TravelMode>('transit');
  const [copied, setCopied] = useState(false);

  // Initialize selectedDestination when listing opens
  const destinationNode = useMemo(() => {
    if (selectedDestination) return selectedDestination;
    if (listing?.destinationNode) return listing.destinationNode;
    return RESCUE_DESTINATION_NODES[0].name;
  }, [selectedDestination, listing]);

  if (!isOpen || !listing) return null;

  const originAddress = `${listing.providerName}, ${listing.providerLocation}`;
  const targetDestination = destinationNode;

  // Build the official Google Maps Directions universal URL prefilled with transit route
  // https://developers.google.com/maps/documentation/urls/get-started#directions-action
  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originAddress
  )}&destination=${encodeURIComponent(targetDestination)}&travelmode=${travelMode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(googleMapsRouteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  const travelModes: { id: TravelMode; label: string; icon: React.ReactNode }[] = [
    { id: 'transit', label: 'Transit', icon: <Bus className="w-3.5 h-3.5" /> },
    { id: 'driving', label: 'Driving', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'bicycling', label: 'Bicycle', icon: <Bike className="w-3.5 h-3.5" /> },
    { id: 'walking', label: 'Walking', icon: <Footprints className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transit-qr-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="transit-qr-modal-title" className="text-base font-bold text-white">
                  Transit Route QR Code
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
                  Google Maps Transit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scan with smartphone camera to launch turn-by-turn navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-qr-modal-btn"
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Food Payload Pill */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Active Payload
              </span>
              <div className="text-sm font-bold text-white truncate max-w-[260px] sm:max-w-xs">
                {listing.foodItem}
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300">
              {listing.quantity}
            </span>
          </div>

          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
            <div className="bg-white p-3.5 rounded-xl shadow-xl flex items-center justify-center">
              <QRCodeSVG
                value={googleMapsRouteUrl}
                size={200}
                level="H"
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>

            {/* Scan Guidance with phone icon */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 text-center font-medium">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Scan with mobile camera to open pre-filled route</span>
            </div>
          </div>

          {/* Mode Selector (Transit / Driving / Bicycle / Walking) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Maps Transit Mode:
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              {travelModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTravelMode(mode.id)}
                  className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    travelMode === mode.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Route Origin & Destination Summary */}
          <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {/* Origin */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <MapPin className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Pickup Origin (Donor)
                </span>
                <div className="text-white font-semibold truncate">
                  {listing.providerName}
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  {listing.providerLocation}
                </div>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-slate-800 ml-2.5 h-3 my-0.5" />

            {/* Destination */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Target Recipient Node
                  </span>
                </div>
                <select
                  value={destinationNode}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {RESCUE_DESTINATION_NODES.map((node) => (
                    <option key={node.name} value={node.name}>
                      {node.name} ({node.distance}, ~{node.travelTimeMin}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Raw Link with Copy & Direct Open Button */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[280px] text-slate-500">
                {googleMapsRouteUrl}
              </span>
              <span className="text-emerald-400 shrink-0 ml-2">mode: {travelMode}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                id="copy-transit-url-btn"
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Route URL</span>
                  </>
                )}
              </button>

              <a
                href={googleMapsRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="open-google-maps-tab-btn"
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 transition-colors cursor-pointer"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Google Maps Universal Route Link</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
