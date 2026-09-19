import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Sparkles,
  ExternalLink,
  Search,
  X,
  Loader2,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { requestGoogleMapsGrounding, MapsGroundingResponse } from '../lib/mapsGrounding';

interface GoogleMapsFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  defaultDestination?: string;
  foodItem?: string;
  onSelectNode?: (nodeName: string) => void;
}

export const GoogleMapsFinderModal: React.FC<GoogleMapsFinderModalProps> = ({
  isOpen,
  onClose,
  defaultLocation = 'San Francisco, CA',
  defaultDestination = '',
  foodItem = 'Prepared meals & bakery surplus',
  onSelectNode,
}) => {
  const [location, setLocation] = useState(defaultLocation);
  const [destination, setDestination] = useState(defaultDestination);
  const [queryType, setQueryType] = useState<'search_nodes' | 'route_intel' | 'verify_address'>('search_nodes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MapsGroundingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await requestGoogleMapsGrounding({
        queryType,
        location: location.trim(),
        destination: destination.trim() || undefined,
        foodItem,
      });
      setResult(data);
    } catch (err: any) {
      console.error('Failed to query Google Maps grounding:', err);
      setError(err?.message || 'Failed to retrieve Google Maps grounding. Please verify your GEMINI_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset locations
  const sampleLocations = [
    'Mission District, San Francisco, CA',
    'Downtown Los Angeles, CA',
    'Manhattan, New York, NY',
    'Austin, TX',
    'Chicago, IL',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Google Maps Rescue Radar
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  gemini-3.5-flash
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 hidden sm:inline">
                  googleMaps tool
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Google Maps Grounding for real-time recipient verification and transit intelligence
              </p>
            </div>
          </div>
          <button
            id="close-maps-modal-btn"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 p-2 bg-slate-950/60 border-b border-slate-800 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setQueryType('search_nodes')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              queryType === 'search_nodes'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Nearby Shelters</span>
          </button>
          <button
            type="button"
            onClick={() => setQueryType('route_intel')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              queryType === 'route_intel'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span>Transit Route Intel</span>
          </button>
          <button
            type="button"
            onClick={() => setQueryType('verify_address')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              queryType === 'verify_address'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Verify Address</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Query Inputs */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {queryType === 'route_intel' ? 'Origin / Pickup Address:' : 'Search Location or Donor Address:'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 500 Howard St, San Francisco, CA"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {queryType === 'route_intel' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destination Emergency Node:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. St. Anthony Foundation, 150 Golden Gate Ave, San Francisco"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Quick Sample chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">Presets:</span>
              {sampleLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setLocation(loc);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                >
                  {loc.split(',')[0]}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Grounding with Google Maps via gemini-3.5-flash...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span>
                    {queryType === 'route_intel'
                      ? 'Fetch Live Google Maps Route Intelligence'
                      : queryType === 'verify_address'
                      ? 'Verify Address on Google Maps'
                      : 'Find Verified Food Rescue Nodes'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Google Maps Grounding Notice:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Initial Helper Banner when no query has run */}
          {!result && !loading && !error && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">
                Real-Time Google Maps Grounding
              </h4>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                Connects directly to Gemini 3.5 Flash using the native <code className="text-emerald-300 font-mono">googleMaps</code> tool to pinpoint real food banks, verify street addresses, and calculate live transport corridors.
              </p>
            </div>
          )}

          {/* Grounding Result Output */}
          {result && (
            <div className="space-y-4 animate-in fade-in">
              {/* Grounded Badge */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Google Maps Grounded Data</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Model: {result.model || 'gemini-3.5-flash'}
                </span>
              </div>

              {/* Text Response formatted */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                {result.text}
              </div>

              {/* Grounding Place Chunks / Citations if present */}
              {result.groundingMetadata?.groundingChunks && result.groundingMetadata.groundingChunks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Grounded Places & Source Citations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.groundingMetadata.groundingChunks.map((chunk, idx) => {
                      const place = chunk.places;
                      const web = chunk.web;
                      if (!place && !web) return null;

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-1 flex flex-col justify-between"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {place?.name || web?.title || `Place #${idx + 1}`}
                            </div>
                            {place?.formattedAddress && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {place.formattedAddress}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-2">
                            {onSelectNode && place?.name && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectNode(place.name || '');
                                  onClose();
                                }}
                                className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                              >
                                Select Destination
                              </button>
                            )}

                            {(place?.websiteUri || web?.uri) && (
                              <a
                                href={place?.websiteUri || web?.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 ml-auto"
                              >
                                <span>Google Maps View</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            Powered by Google Maps Grounding & Gemini 3.5 Flash
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
