import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Truck,
  Building2,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  User,
  Radio
} from 'lucide-react';
import { SurplusListing, RescueMessage, MessageRole } from '../types';
import { subscribeToRescueMessages, sendRescueMessage } from '../lib/firebase';
import { auth } from '../lib/firebase';

interface RescueLogisticsChatProps {
  listing: SurplusListing;
  compact?: boolean;
  defaultRole?: MessageRole;
  title?: string;
  subtitle?: string;
}

const QUICK_DISPATCH_TAGS = [
  { label: '🚚 En route to pickup', tag: 'en-route', role: 'volunteer' },
  { label: '⏱️ Arriving in ~10m', tag: 'arriving-10m', role: 'volunteer' },
  { label: '📍 At rear loading dock', tag: 'at-dock', role: 'volunteer' },
  { label: '📦 Food packaged & chilled', tag: 'loaded', role: 'provider' },
  { label: '🚪 Dock buzzer is #2', tag: 'general', role: 'provider' },
  { label: '⚠️ Slight transit delay', tag: 'delayed', role: 'volunteer' },
] as const;

export const RescueLogisticsChat: React.FC<RescueLogisticsChatProps> = ({
  listing,
  compact = false,
  defaultRole = 'volunteer',
  title = 'Rescue Logistics & Handover Chat',
  subtitle = 'Coordinate arrival timing, dock access, and cold-chain handover via live Firestore',
}) => {
  const [messages, setMessages] = useState<RescueMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [activeRole, setActiveRole] = useState<MessageRole>(defaultRole);
  const [activeSenderName, setActiveSenderName] = useState(
    defaultRole === 'volunteer'
      ? (listing.claimedBy || 'Volunteer Courier')
      : (listing.providerName || 'Surplus Food Provider')
  );
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to real-time Firestore messages
  useEffect(() => {
    if (!listing.id) return;

    const unsubscribe = subscribeToRescueMessages(
      listing.id,
      (incoming) => {
        setMessages(incoming);
        setIsConnected(true);
      },
      (err) => {
        console.warn('Real-time chat listener notification:', err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listing.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep sender name synced if role toggled
  const handleRoleChange = (role: MessageRole) => {
    setActiveRole(role);
    if (role === 'volunteer') {
      setActiveSenderName(listing.claimedBy || 'Volunteer Courier (Rapid Dispatch)');
    } else if (role === 'provider') {
      setActiveSenderName(`${listing.providerName} (Dispatch Desk)`);
    } else {
      setActiveSenderName('Central Rescue Coordinator');
    }
  };

  const handleSendMessage = async (customText?: string, quickTag?: any) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || sending) return;

    setSending(true);
    const currentUser = auth.currentUser;

    const newMessage: Omit<RescueMessage, 'id'> = {
      listingId: listing.id,
      senderRole: activeRole,
      senderName: activeSenderName || (activeRole === 'volunteer' ? 'Volunteer' : 'Provider Staff'),
      senderUid: currentUser?.uid || undefined,
      text: textToSend,
      timestamp: Date.now(),
      quickTag: quickTag || 'general',
    };

    try {
      await sendRescueMessage(listing.id, newMessage);
      if (!customText) {
        setInputText('');
      }
    } catch (e) {
      console.warn('Failed to send message via Firestore, using optimistic state:', e);
      // Fallback optimistic display
      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          id: `local-${Date.now()}`,
        },
      ]);
      if (!customText) {
        setInputText('');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ms: number) => {
    const date = new Date(ms);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col overflow-hidden ${
        compact ? 'text-xs' : 'text-xs'
      }`}
    >
      {/* Chat Header */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <span>{title}</span>
              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Sync
              </span>
            </div>
            {!compact && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        </div>

        {/* Sender Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => handleRoleChange('volunteer')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeRole === 'volunteer'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Driver</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('provider')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeRole === 'provider'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Provider</span>
          </button>
        </div>
      </div>

      {/* Quick Status Chips */}
      <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">Quick Notes:</span>
        {QUICK_DISPATCH_TAGS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.label, item.tag)}
            disabled={sending}
            className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div
        className={`p-3 space-y-2.5 overflow-y-auto bg-slate-950/60 ${
          compact ? 'max-h-44 min-h-32' : 'max-h-52 min-h-36'
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Radio className="w-5 h-5 text-slate-600 mb-1 animate-pulse" />
            <p className="text-[11px] font-medium text-slate-400">
              No dispatch notes yet.
            </p>
            <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">
              Send an arrival ETA, dock instructions, or cold-chain handover update above.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isVolunteer = msg.senderRole === 'volunteer';
            const isMe = msg.senderRole === activeRole;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                  <span className={`font-bold ${isVolunteer ? 'text-sky-400' : 'text-amber-400'}`}>
                    {msg.senderName}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{formatTime(msg.timestamp)}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs shadow-sm break-words ${
                    isMe
                      ? isVolunteer
                        ? 'bg-sky-600 text-white rounded-br-none'
                        : 'bg-amber-600 text-slate-950 font-medium rounded-br-none'
                      : isVolunteer
                      ? 'bg-slate-800 text-slate-200 border border-sky-500/30 rounded-bl-none'
                      : 'bg-slate-800 text-slate-200 border border-amber-500/30 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type status note as ${activeRole === 'volunteer' ? 'Driver' : 'Provider'}...`}
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          title="Send dispatch note"
          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
