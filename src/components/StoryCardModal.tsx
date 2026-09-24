import React, { useState, useEffect, useCallback } from 'react';
import { X, Disc3, Music2, Share2, Check, Sparkles, Camera, Instagram, Film, MessageCircle, Copy, Loader2, ArrowLeft } from 'lucide-react';
import { Song, DestinationOption, DetectedVibeData } from '../types';
import { executeSocialShare, ShareTarget, buildSocialCaption } from '../utils/socialShare';

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  song: Song;
  destination: DestinationOption;
  vibeData: DetectedVibeData;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  song,
  destination,
  vibeData,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe dismiss that also cleans up browser history if a state was pushed
  const handleSafeClose = useCallback(() => {
    if (isPreparing) return;
    if (window.history.state?.modal === 'story-card-modal') {
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

    window.history.pushState({ modal: 'story-card-modal' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, handleSafeClose, onClose]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleShare = async (target: ShareTarget) => {
    setIsPreparing(true);
    showToast('Preparing your share...');
    try {
      const res = await executeSocialShare(target, photoUrl, song, (step) => {
        setToastMessage(step);
      });
      showToast(res.nextStepInstruction || res.message);
    } catch {
      showToast('Media prepared for sharing!');
    } finally {
      setIsPreparing(false);
    }
  };

  const handleCopyLink = () => {
    const text = buildSocialCaption(song, 'instagram-post', destination);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Soundtrack details copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isVertical = destination === 'Instagram Story' || destination === 'Reel' || destination === 'WhatsApp Status';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-[#17151A]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPreparing) handleSafeClose();
      }}
    >
      <div className="relative w-full max-w-sm max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl overflow-hidden brand-surface border-t sm:border border-[#C9A6B8]/40 shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        
        {/* Mobile top pull bar */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#1A171F]">
          <div className="w-10 h-1 bg-[#8E7A86]/40 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#1A171F] px-4 py-3 border-b border-[#2A2630] flex items-center justify-between flex-shrink-0">
          <button
            id="btn-back-story-modal"
            onClick={handleSafeClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A2630] hover:bg-[#342F3D] text-[#F4EEE7] hover:text-white transition-colors text-xs font-semibold"
            title="Back to song recommendations"
          >
            <ArrowLeft className="w-4 h-4 text-[#D8B88C]" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#F4EEE7] font-mono-accent">
            <Sparkles className="w-3.5 h-3.5 text-[#D8B88C]" />
            <span>{destination} Mockup</span>
          </div>

          <button
            id="btn-close-story-modal"
            onClick={handleSafeClose}
            className="p-1.5 rounded-full bg-[#2A2630] hover:bg-[#342F3D] text-[#B9AFB7] hover:text-[#F4EEE7] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto overscroll-contain p-4 space-y-4 flex-1 flex flex-col items-center">
          {/* Social Card Mockup */}
          <div
            className={`relative w-full rounded-2xl overflow-hidden bg-[#17151A] shadow-inner border border-[#2A2630] ${
              isVertical ? 'aspect-[9/16] max-h-[460px]' : 'aspect-square max-h-[360px]'
            }`}
          >
            {/* Base Photo */}
            <img
              src={photoUrl}
              alt="Preview mockup"
              className="w-full h-full object-cover"
            />

            {/* Subtle Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#17151A]/85 via-transparent to-[#17151A]/40 pointer-events-none" />

            {/* Destination Header mock */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[#F4EEE7] text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#211E25] border border-[#D8B88C] flex items-center justify-center text-[9px] font-bold text-[#D8B88C]">
                  VM
                </div>
                <span className="font-semibold text-xs tracking-tight">Your {destination.split(' ')[0]}</span>
              </div>
              <span className="text-[10px] font-mono-accent text-[#F4EEE7] bg-[#17151A]/70 px-2 py-0.5 rounded-full backdrop-blur-sm border border-[#2A2630]">
                {song.mood} Vibe
              </span>
            </div>

            {/* Music Sticker */}
            <div className="absolute bottom-6 left-4 right-4 p-3 rounded-2xl bg-[#F4EEE7]/95 text-[#17151A] backdrop-blur-xl shadow-2xl border border-white/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#211E25] flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow">
                <Disc3 className="w-5 h-5 text-[#D8B88C] animate-spin" />
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#C9A6B8]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Music2 className="w-3.5 h-3.5 text-[#8E7A86] flex-shrink-0" />
                  <h4 className="text-xs font-bold truncate leading-tight text-[#17151A]">
                    {song.title}
                  </h4>
                </div>
                <p className="text-[11px] text-[#8E7A86] truncate font-medium">
                  {song.artist}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2A2630] text-[#D8B88C] font-semibold uppercase font-mono-accent">
                    {song.language}
                  </span>
                  <span className="text-[9px] text-[#8E7A86] truncate">
                    {song.vibeTags[0]}
                  </span>
                </div>
              </div>

              {/* Live animated equalizer lines */}
              <div className="flex items-end gap-1 h-5 px-1.5 flex-shrink-0">
                <span className="w-1 h-full bg-[#17151A] rounded-full animate-[pulse_0.75s_ease-in-out_infinite]" />
                <span className="w-1 h-3/5 bg-[#17151A] rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
                <span className="w-1 h-4/5 bg-[#17151A] rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
                <span className="w-1 h-2/5 bg-[#17151A] rounded-full animate-[pulse_0.65s_ease-in-out_infinite]" />
                <span className="w-1 h-3/4 bg-[#17151A] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>

          {/* Toast Feedback */}
          {toastMessage && (
            <div className="w-full p-2.5 rounded-xl bg-[#D8B88C]/15 border border-[#D8B88C]/40 text-[#D8B88C] text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="leading-tight">{toastMessage}</span>
            </div>
          )}

          {/* Direct Social Share Buttons */}
          <div className="w-full grid grid-cols-2 gap-2">
            <button
              id="btn-storymodal-share-ig-story"
              disabled={isPreparing}
              onClick={() => handleShare('instagram-story')}
              className="p-2.5 rounded-xl bg-[#2A2630] hover:bg-[#352D3E] border border-[#C9A6B8]/30 hover:border-[#DD2476]/60 text-[#F4EEE7] text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-[#FF758C]" />
              <span>IG Story</span>
            </button>

            <button
              id="btn-storymodal-share-ig-post"
              disabled={isPreparing}
              onClick={() => handleShare('instagram-post')}
              className="p-2.5 rounded-xl bg-[#2A2630] hover:bg-[#352D3E] border border-[#C9A6B8]/30 hover:border-[#833AB4]/60 text-[#F4EEE7] text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Instagram className="w-3.5 h-3.5 text-[#C9A6B8]" />
              <span>IG Post</span>
            </button>

            <button
              id="btn-storymodal-share-ig-reel"
              disabled={isPreparing}
              onClick={() => handleShare('instagram-reel')}
              className="p-2.5 rounded-xl bg-[#2A2630] hover:bg-[#352D3E] border border-[#C9A6B8]/30 hover:border-[#405DE6]/60 text-[#F4EEE7] text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Film className="w-3.5 h-3.5 text-[#82B1FF]" />
              <span>IG Reel</span>
            </button>

            <button
              id="btn-storymodal-share-wa-status"
              disabled={isPreparing}
              onClick={() => handleShare('whatsapp-status')}
              className="p-2.5 rounded-xl bg-[#2A2630] hover:bg-[#1D3627] border border-[#25D366]/30 hover:border-[#25D366]/60 text-[#F4EEE7] text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WA Status</span>
            </button>
          </div>

          {/* Action Button: Copy Caption */}
          <button
            id="btn-copy-sticker-info"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-xl bg-[#211E25] hover:bg-[#2A2630] border border-[#D8B88C]/40 text-[#D8B88C] font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#D8B88C]" />
                <span>Copied Soundtrack Details!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Full Caption & Tags</span>
              </>
            )}
          </button>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-30 bg-[#1A171F] px-4 py-3 border-t border-[#2A2630] flex items-center justify-center flex-shrink-0">
          <button
            id="btn-storymodal-bottom-back"
            onClick={handleSafeClose}
            className="w-full py-2.5 px-3 rounded-xl bg-[#2A2630] hover:bg-[#342F3D] border border-[#3E3846] text-[#F4EEE7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4 text-[#D8B88C]" />
            <span>Back to Song Recommendations</span>
          </button>
        </div>

      </div>
    </div>
  );
};
