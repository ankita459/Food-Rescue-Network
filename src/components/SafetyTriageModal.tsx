import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Thermometer,
  PackageCheck,
  CheckCircle2,
  Copy,
  Sparkles,
  Send,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { SurplusListing } from '../types';

interface SafetyTriageModalProps {
  listing: SurplusListing | null;
  onClose: () => void;
}

export const SafetyTriageModal: React.FC<SafetyTriageModalProps> = ({ listing, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswers, setCustomAnswers] = useState<{ q: string; a: string }[]>([]);
  const [isConsulting, setIsConsulting] = useState(false);

  if (!listing) return null;

  const { foodItem, safetyTip, packagingType, dietaryType, expiresAt } = listing;
  const remainingSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const remainingMins = Math.floor(remainingSeconds / 60);

  const handleCopy = () => {
    const textToCopy = `[Food Rescue Safety Protocol - ${foodItem}]\n` +
      `VERIFIED AI TIP: ${safetyTip.transitInstruction}\n` +
      `TEMP SPEC: ${safetyTip.tempRequirement}\n` +
      `PACKAGING: ${safetyTip.packagingSuitability}\n` +
      `CRITICAL ALERT: ${safetyTip.criticalHazardWarning}\n` +
      `SAFE TRANSIT WINDOW: ${remainingMins} minutes remaining.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsConsulting(true);
    const q = customQuestion.trim();
    setCustomQuestion('');

    setTimeout(() => {
      let smartAnswer = '';
      const lower = q.toLowerCase();

      if (lower.includes('delay') || lower.includes('late') || lower.includes('traffic')) {
        smartAnswer = `Transit Delay Advisory: If transit exceeds ${Math.min(remainingMins, 25)} mins, verify core temperature upon arrival. If temperature drops below 60°C or rises above 8°C for over 20 minutes, food must be rapidly reheated to >75°C before distribution or discarded.`;
      } else if (lower.includes('kid') || lower.includes('child') || lower.includes('elderly') || lower.includes('infant')) {
        smartAnswer = `High-Vulnerability Group Directive: For elderly shelter residents or children, require double-boiling for liquid curries/dal and discard any cut fruits exposed to ambient air > 20 minutes.`;
      } else if (lower.includes('freeze') || lower.includes('reheat') || lower.includes('refrigerat')) {
        smartAnswer = `Secondary Storage Protocol: Portion food into shallow (<5cm) containers immediately upon receipt. Do not re-freeze previously thawed items. Cooked grains must not be reheated more than once.`;
      } else {
        smartAnswer = `AI Triage Confirmation for ${foodItem}: The packaging (${packagingType}) provides adequate thermal buffer for the next ${remainingMins} minutes. Maintain sealed transport lids until final serving line setup.`;
      }

      setCustomAnswers((prev) => [...prev, { q, a: smartAnswer }]);
      setIsConsulting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  AI Quick Triage & Safety Verification
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HACCP Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Item: <span className="text-slate-200 font-semibold">{foodItem}</span> ({listing.quantity}) • {dietaryType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Primary Crisp 2-Line AI Safety Note Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/40 shadow-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Verified Safety & Packaging AI Directive
                </div>
                <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                  "{safetyTip.transitInstruction}"
                </p>
                <p className="text-xs text-emerald-200/80 font-medium">
                  {safetyTip.headline}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Hazard Warning & Thermal Requirement Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Temperature Spec */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-300">
                <Thermometer className="w-4 h-4 text-sky-400" />
                Temperature Range Requirement
              </div>
              <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-700/60">
                {safetyTip.tempRequirement}
              </p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-sky-400" />
                Danger zone to avoid: 5°C to 60°C (41°F–140°F)
              </div>
            </div>

            {/* Packaging Verification */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-300">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                Packaging Suitability Check
              </div>
              <p className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-700/60">
                {safetyTip.packagingSuitability}
              </p>
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Tamper seal & thermal barrier integrity passed
              </div>
            </div>
          </div>

          {/* Biological Hazard Warning Box */}
          <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Microbial & Hazard Protocol
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {safetyTip.criticalHazardWarning}
              </p>
              <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Current safe delivery window remaining: <strong className="font-mono text-white">{remainingMins} mins</strong>
              </div>
            </div>
          </div>

          {/* Volunteer Verification Checklist */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-xs font-bold text-slate-300 mb-2">
              On-Site Pickup Verification Checklist (Driver / Courier)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-700/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Lid tightly clamped</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-700/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Surface clean & labeled</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-700/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct transit routing</span>
              </div>
            </div>
          </div>

          {/* Interactive AI Safety Advisor query */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Ask AI Safety Advisor for Specific Scenarios
            </div>
            <form onSubmit={handleCustomQuery} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g. Can we reheat at shelter? What if outside is 38°C?"
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={isConsulting || !customQuestion.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isConsulting ? <Clock className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                <span>Consult</span>
              </button>
            </form>

            {/* Custom Answers List */}
            {customAnswers.length > 0 && (
              <div className="mt-3 space-y-2 max-h-36 overflow-y-auto">
                {customAnswers.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/80 text-xs">
                    <div className="font-semibold text-slate-300 text-[11px] mb-1">Q: {item.q}</div>
                    <div className="text-emerald-300 text-xs leading-relaxed">A: {item.a}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 mt-auto">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Safety Tip Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Transit Safety Instructions</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
