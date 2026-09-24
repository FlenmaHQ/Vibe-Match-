import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Loader2,
  Info,
  Send,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Song, DestinationOption } from '../types';
import {
  executeSocialShare,
  ShareTarget,
  ShareExecutionResult,
  buildSocialCaption,
  downloadMediaFile,
} from '../utils/socialShare';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  photoUrl: string;
  destination?: DestinationOption;
  initialTarget?: ShareTarget;
  autoTrigger?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  song,
  photoUrl,
  destination = 'Instagram Story',
  initialTarget,
  autoTrigger = false,
}) => {
  const [activeTarget, setActiveTarget] = useState<ShareTarget | null>(initialTarget || null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepStatus, setPrepStatus] = useState<string>('Preparing your share...');
  const [lastResult, setLastResult] = useState<ShareExecutionResult | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Safe dismiss that also cleans up browser history if a state was pushed
  const handleSafeClose = useCallback(() => {
    if (isPreparing) return;
    if (window.history.state?.modal === 'share-modal') {
      window.history.back();
    } else {
      onClose();
    }
  }, [isPreparing, onClose]);

  // Support ESC key & mobile back button/gesture
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSafeClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Push history state so Android hardware back or swipe back gesture closes the modal
    window.history.pushState({ modal: 'share-modal' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, handleSafeClose, onClose]);

  // Auto-trigger if explicitly passed from direct one-click flow
  useEffect(() => {
    if (isOpen && autoTrigger && initialTarget && !lastResult && !isPreparing) {
      handleShare(initialTarget);
    }
  }, [isOpen, autoTrigger, initialTarget]);

  if (!isOpen) return null;

  const handleShare = async (target: ShareTarget) => {
    setActiveTarget(target);
    setIsPreparing(true);
    setPrepStatus('Preparing your share...');
    setLastResult(null);

    try {
      const result = await executeSocialShare(target, photoUrl, song, (status) => {
        setPrepStatus(status);
      });
      setLastResult(result);
    } catch (err: any) {
      console.warn('Share error:', err);
      setLastResult({
        target,
        actionTaken: 'download-fallback',
        success: false,
        message: 'Could not complete automatic share.',
        nextStepInstruction: `Please copy the caption and share your photo directly to ${target}.`,
      });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleCopyCaption = async () => {
    const target = activeTarget || 'instagram-post';
    const caption = buildSocialCaption(song, target, destination);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(caption);
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(false), 2200);
      }
    } catch {
      // ignore
    }
  };

  const handleManualDownload = () => {
    if (lastResult?.preparedMedia?.file) {
      downloadMediaFile(lastResult.preparedMedia.file);
    }
  };

  return (
    <div
      id="share-modal-overlay"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-[#17151A]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPreparing) handleSafeClose();
      }}
    >
      <div className="relative w-full max-w-md max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl brand-surface border-t sm:border border-[#C9A6B8]/40 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        
        {/* Mobile top pull indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#1A171F]">
          <div className="w-10 h-1 bg-[#8E7A86]/40 rounded-full" />
        </div>

        {/* Sticky Modal Header - ALWAYS visible, never scrolled away */}
        <div className="sticky top-0 z-30 bg-[#1A171F] px-4 sm:px-5 py-3 border-b border-[#2A2630] flex items-center justify-between flex-shrink-0">
          <button
            id="btn-back-share-modal"
            disabled={isPreparing}
            onClick={handleSafeClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A2630] hover:bg-[#342F3D] text-[#F4EEE7] hover:text-white transition-colors text-xs font-semibold disabled:opacity-50"
            title="Back to song recommendations"
          >
            <ArrowLeft className="w-4 h-4 text-[#D8B88C]" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#D8B88C]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F4EEE7]">Share Story & Track</h3>
          </div>

          <button
            id="btn-close-share-modal"
            disabled={isPreparing}
            onClick={handleSafeClose}
            className="p-1.5 rounded-full bg-[#2A2630] hover:bg-[#342F3D] text-[#B9AFB7] hover:text-[#F4EEE7] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4 flex-1">
          {/* Selected Song Preview Banner */}
          <div className="p-3.5 rounded-2xl bg-[#17151A]/60 border border-[#2A2630] flex items-center gap-3">
          {song.artworkUrl ? (
            <img
              src={song.artworkUrl}
              alt={song.title}
              className="w-12 h-12 rounded-xl object-cover border border-[#2A2630] flex-shrink-0 shadow"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#211E25] border border-[#2A2630] flex items-center justify-center flex-shrink-0 text-[#D8B88C] font-bold">
              {song.language?.slice(0, 2).toUpperCase() || 'VM'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-xs font-bold text-[#F4EEE7] truncate">{song.title}</h4>
              <span className="text-[10px] font-mono-accent text-[#D8B88C] font-semibold flex-shrink-0">
                {song.matchScore || 90}% match
              </span>
            </div>
            <p className="text-[11px] text-[#B9AFB7] truncate">{song.artist}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2A2630] text-[#D8B88C] font-mono-accent">
                {song.language}
              </span>
              <span className="text-[9px] text-[#8E7A86] truncate">{song.genre}</span>
            </div>
          </div>
        </div>

        {/* Preparing Spinner State */}
        {isPreparing && (
          <div
            id="share-preparing-indicator"
            className="p-4 rounded-2xl bg-[#2A2630]/90 border border-[#D8B88C]/40 flex flex-col items-center justify-center text-center space-y-2.5 animate-in fade-in duration-200"
          >
            <Loader2 className="w-6 h-6 animate-spin text-[#D8B88C]" />
            <div>
              <p className="text-xs font-bold text-[#F4EEE7]">Preparing your photo & song...</p>
              <p className="text-[11px] text-[#D8B88C] mt-0.5">{prepStatus}</p>
            </div>
          </div>
        )}

        {/* Outcome / Instruction Banner (Clean 1-sentence Next Step) */}
        {!isPreparing && lastResult && (
          <div
            id="share-instruction-box"
            className="p-3.5 rounded-2xl bg-[#D8B88C]/10 border border-[#D8B88C]/30 flex flex-col space-y-2.5 animate-in fade-in duration-200"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#D8B88C] flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-semibold text-[#F4EEE7] leading-snug">
                  {lastResult.nextStepInstruction}
                </p>
                <p className="text-[10px] text-[#B9AFB7] mt-1 font-mono-accent">
                  {lastResult.message}
                </p>
              </div>
            </div>

            {/* Quick Actions after share */}
            <div className="pt-2 border-t border-[#2A2630] flex items-center justify-between gap-2">
              {lastResult.preparedMedia?.file && (
                <button
                  id="btn-redownload-media"
                  type="button"
                  onClick={handleManualDownload}
                  className="py-1.5 px-3 rounded-lg bg-[#2A2630] hover:bg-[#352D3E] text-[#D8B88C] text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Media File</span>
                </button>
              )}
              <button
                id="btn-copy-caption-feedback"
                type="button"
                onClick={handleCopyCaption}
                className="py-1.5 px-3 rounded-lg bg-[#2A2630] hover:bg-[#352D3E] text-[#F4EEE7] text-[11px] font-medium flex items-center gap-1.5 transition-colors ml-auto"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D8B88C]" />
                    <span className="text-[#D8B88C]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Song Details</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Return Button in Instruction Card */}
            <button
              id="btn-instruction-back-songs"
              type="button"
              onClick={handleSafeClose}
              className="w-full py-2 px-3 rounded-xl bg-[#2A2630]/80 hover:bg-[#2A2630] text-[#F4EEE7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#3E3846]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D8B88C]" />
              <span>Done & Return to Song Matches</span>
            </button>
          </div>
        )}

        {/* 4 Simple Destination Buttons (Strictly as specified in Requirement 8) */}
        <div className="space-y-2.5">
          <p className="text-[10px] uppercase font-mono-accent tracking-wider text-[#8E7A86]">
            Select destination platform
          </p>

          {/* 1. 🎵 Instagram Reel */}
          <button
            id="btn-share-ig-reel"
            disabled={isPreparing}
            onClick={() => handleShare('instagram-reel')}
            className="w-full group p-3.5 rounded-2xl bg-gradient-to-r from-[#2A2630] to-[#211E25] hover:from-[#352D3E] hover:to-[#2A2630] border border-[#C9A6B8]/30 hover:border-[#C9A6B8]/70 flex items-center justify-between transition-all shadow-sm disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" role="img" aria-label="reel">🎵</span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F4EEE7]">Instagram Reel</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#DD2476]/20 text-[#FF758C] font-mono-accent font-semibold">
                    15s Video
                  </span>
                </div>
                <p className="text-[11px] text-[#B9AFB7]">Formats 15s vertical video with live lines & Reel audio</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E7A86] group-hover:text-[#F4EEE7] transition-colors flex-shrink-0" />
          </button>

          {/* 2. 📸 Instagram Story */}
          <button
            id="btn-share-ig-story"
            disabled={isPreparing}
            onClick={() => handleShare('instagram-story')}
            className="w-full group p-3.5 rounded-2xl bg-gradient-to-r from-[#2A2630] to-[#211E25] hover:from-[#352D3E] hover:to-[#2A2630] border border-[#C9A6B8]/30 hover:border-[#C9A6B8]/70 flex items-center justify-between transition-all shadow-sm disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" role="img" aria-label="story">📸</span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F4EEE7]">Instagram Story</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#833AB4]/20 text-[#C9A6B8] font-mono-accent font-semibold">
                    9:16 Format
                  </span>
                </div>
                <p className="text-[11px] text-[#B9AFB7]">Embeds "{song.title}" badge & opens Story directly</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E7A86] group-hover:text-[#F4EEE7] transition-colors flex-shrink-0" />
          </button>

          {/* 3. 🖼 Instagram Post */}
          <button
            id="btn-share-ig-post"
            disabled={isPreparing}
            onClick={() => handleShare('instagram-post')}
            className="w-full group p-3.5 rounded-2xl bg-gradient-to-r from-[#2A2630] to-[#211E25] hover:from-[#352D3E] hover:to-[#2A2630] border border-[#C9A6B8]/30 hover:border-[#C9A6B8]/70 flex items-center justify-between transition-all shadow-sm disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" role="img" aria-label="post">🖼</span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F4EEE7]">Instagram Post</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#405DE6]/20 text-[#82B1FF] font-mono-accent font-semibold">
                    Feed Media
                  </span>
                </div>
                <p className="text-[11px] text-[#B9AFB7]">Prepares feed portrait/square ratio & saves to photos</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E7A86] group-hover:text-[#F4EEE7] transition-colors flex-shrink-0" />
          </button>

          {/* 4. 💚 WhatsApp Status */}
          <button
            id="btn-share-wa-status"
            disabled={isPreparing}
            onClick={() => handleShare('whatsapp-status')}
            className="w-full group p-3.5 rounded-2xl bg-gradient-to-r from-[#2A2630] to-[#211E25] hover:from-[#1D3627] hover:to-[#2A2630] border border-[#25D366]/30 hover:border-[#25D366]/70 flex items-center justify-between transition-all shadow-sm disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" role="img" aria-label="whatsapp">💚</span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F4EEE7]">WhatsApp Status</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#25D366]/20 text-[#25D366] font-mono-accent font-semibold">
                    Status 9:16
                  </span>
                </div>
                <p className="text-[11px] text-[#B9AFB7]">Targets WhatsApp Status with 9:16 media attached</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E7A86] group-hover:text-[#F4EEE7] transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* Caption & Info footer */}
        <div className="pt-2 border-t border-[#2A2630] flex items-center justify-between">
          <span className="text-[10px] text-[#8E7A86] font-mono-accent">
            Subject preserved • 9:16 vertical format
          </span>
        </div>
      </div>

      {/* Sticky Modal Footer - ALWAYS visible at the bottom on all screen sizes */}
      <div className="sticky bottom-0 z-30 bg-[#1A171F] px-4 sm:px-5 py-3 border-t border-[#2A2630] flex items-center justify-between gap-3 flex-shrink-0">
        <button
          id="btn-bottom-back-songs"
          disabled={isPreparing}
          onClick={handleSafeClose}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#2A2630] hover:bg-[#342F3D] border border-[#3E3846] text-[#F4EEE7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99] disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 text-[#D8B88C]" />
          <span>Back to Song Recommendations</span>
        </button>

        <button
          id="btn-copy-caption-only"
          disabled={isPreparing}
          onClick={handleCopyCaption}
          className="py-2.5 px-3 rounded-xl bg-[#211E25] hover:bg-[#2A2630] border border-[#2A2630] text-[#B9AFB7] hover:text-[#F4EEE7] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          {copiedCaption ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#D8B88C]" />
              <span className="text-[#D8B88C]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Details</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
};
