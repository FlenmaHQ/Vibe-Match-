import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Music,
  Layers,
  Zap,
  Volume2,
  VolumeX,
  Code2,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Headphones,
  Share2,
  Send,
  Smartphone,
} from 'lucide-react';
import { Song, DetectedVibeData, LanguageOption, DestinationOption, VibeLabel, MatchingDiagnostics } from '../types';
import { audioPlayerService, PlaybackState } from '../utils/audioPlayerService';
import { StoryCardModal } from './StoryCardModal';
import { ShareModal } from './ShareModal';
import { ShareTarget } from '../utils/socialShare';

interface ResultsViewProps {
  photoUrl: string;
  vibeData: DetectedVibeData;
  songs: Song[];
  selectedLanguage: LanguageOption;
  selectedDestination: DestinationOption;
  onReset: () => void;
  onOverrideVibe: (vibe: VibeLabel) => void;
  onFindMore: () => void;
  onToneRefine: (toneType: 'upbeat' | 'chill' | 'acoustic' | 'cinematic' | 'dark' | 'dreamy') => void;
  activeVibeOverride?: VibeLabel;
  isRefreshingMore?: boolean;
  diagnostics?: MatchingDiagnostics | null;
}

const ALL_VIBE_LABELS: VibeLabel[] = [
  'Dreamy',
  'Romantic',
  'Cinematic',
  'Peaceful',
  'Confident',
  'Mysterious',
  'Happy',
  'Nostalgic',
  'Cute',
  'Elegant',
  'Energetic',
  'Dark',
  'Travel',
  'Friendship',
];

const TONE_ADJUSTMENTS: { label: string; tone: 'upbeat' | 'chill' | 'acoustic' | 'cinematic' | 'dark' | 'dreamy' }[] = [
  { label: 'More Upbeat / Viral', tone: 'upbeat' },
  { label: 'Chill & Low-fi', tone: 'chill' },
  { label: 'Warm Acoustic', tone: 'acoustic' },
  { label: 'Grand Cinematic', tone: 'cinematic' },
  { label: 'Nocturnal / Dark', tone: 'dark' },
  { label: 'Soft & Ethereal', tone: 'dreamy' },
];

export const ResultsView: React.FC<ResultsViewProps> = ({
  photoUrl,
  vibeData,
  songs,
  selectedLanguage,
  selectedDestination,
  onReset,
  onOverrideVibe,
  onFindMore,
  onToneRefine,
  activeVibeOverride,
  isRefreshingMore = false,
  diagnostics,
}) => {
  const [playback, setPlayback] = useState<PlaybackState>(audioPlayerService.getState());
  const [selectedStorySong, setSelectedStorySong] = useState<Song | null>(null);
  const [selectedShareSong, setSelectedShareSong] = useState<Song | null>(null);
  const [shareAutoTarget, setShareAutoTarget] = useState<ShareTarget | undefined>(undefined);
  const [copiedSongId, setCopiedSongId] = useState<string | null>(null);
  const [showVibeSelector, setShowVibeSelector] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const activeMood = activeVibeOverride || vibeData.primaryVibe;

  useEffect(() => {
    const unsubscribe = audioPlayerService.subscribe((state) => {
      setPlayback(state);
    });
    return () => {
      audioPlayerService.stop();
      unsubscribe();
    };
  }, []);

  // Pre-resolve previews in the background so tracks play instantly
  useEffect(() => {
    const unresolved = songs.filter((s) => !s.previewUrl);
    if (unresolved.length === 0) return;

    fetch('/api/music/resolve-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        songs: unresolved.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          genre: s.genre,
          language: s.language,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.resolved) {
          unresolved.forEach((s) => {
            const r = data.resolved[s.id];
            if (r?.previewUrl) {
              s.previewUrl = r.previewUrl;
              if (r.artworkUrl && !s.artworkUrl) s.artworkUrl = r.artworkUrl;
              if (r.listenUrl) s.listenUrl = r.listenUrl;
            }
            if (r?.resolvedTitle && !s.title.includes(r.resolvedTitle) && s.source !== 'curated-editorial') {
              s.title = r.resolvedTitle;
            }
          });
          // Gentle trigger to re-render in case artwork or preview state changed
          setPlayback((prev) => ({ ...prev }));
        }
      })
      .catch(() => {});
  }, [songs]);

  const handleTogglePlay = (song: Song) => {
    audioPlayerService.toggleSong(song);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioPlayerService.seek(ratio);
  };

  const handleCopy = (song: Song) => {
    const text = `🎧 ${song.title} - ${song.artist}\nMood: ${song.mood} (${song.genre}) | ${song.matchScore || 90}% Match\nWhy it fits: ${song.matchReason || 'Matches visual mood and tempo'}\nDiscovered with VIBE MATCH`;
    navigator.clipboard.writeText(text);
    setCopiedSongId(song.id);
    setTimeout(() => setCopiedSongId(null), 2000);
  };

  const isGeminiSource = vibeData.analysisSource === 'gemini-vision';

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Uploaded Photo & Vibe Profile Focus Card */}
      <div className="relative rounded-3xl overflow-hidden brand-glow-card border border-[#C9A6B8]/30 p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Main Photo Showcase */}
          <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden bg-[#17151A] flex-shrink-0 border border-[#2A2630] shadow-lg">
            <img
              src={photoUrl}
              alt="Uploaded vibe"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#17151A]/85 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-[#F4EEE7]">
              <span className="font-mono-accent uppercase tracking-wider bg-[#17151A]/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-[#2A2630]">
                {selectedDestination}
              </span>
              {vibeData.lighting && (
                <span className="font-mono-accent text-[9.5px] text-[#D8B88C] bg-[#17151A]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-[#2A2630]">
                  {vibeData.lighting}
                </span>
              )}
            </div>
          </div>

          {/* Vibe Analysis Badge & Info */}
          <div className="flex-1 min-w-0 space-y-2 text-left w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2A2630] border border-[#D8B88C]/30 text-[#D8B88C] text-[10px] font-mono-accent uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#C9A6B8]" />
                <span>{isGeminiSource ? 'Gemini 3.8 Vision Vibe' : 'Optical Tone Analysis'}</span>
              </div>

              {/* Adjust mood chip toggle */}
              <button
                id="btn-toggle-vibe-selector"
                onClick={() => setShowVibeSelector(!showVibeSelector)}
                className="text-xs text-[#B8A7C9] hover:text-[#F4EEE7] flex items-center gap-1 font-mono-accent transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showVibeSelector ? 'Close' : 'Adjust Mood'}</span>
              </button>
            </div>

            {/* Primary Vibe Headline */}
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#F4EEE7]">
                  {activeMood}
                </h2>
                <span className="text-sm font-medium text-[#C9A6B8]">
                  / {vibeData.secondaryVibe}
                </span>
              </div>
              <p className="text-xs text-[#B9AFB7] leading-relaxed mt-0.5">
                {vibeData.aestheticDescriptor || vibeData.description}
              </p>
            </div>

            {/* Visual Vector Scores Summary Bar */}
            <div className="grid grid-cols-4 gap-1.5 pt-1 font-mono-accent text-[9.5px]">
              <div className="bg-[#211E25] border border-[#2A2630] rounded-lg p-1.5 text-center">
                <span className="text-[#8E7A86] block">ENERGY</span>
                <span className="text-[#D8B88C] font-semibold">{vibeData.energy ?? 50}%</span>
              </div>
              <div className="bg-[#211E25] border border-[#2A2630] rounded-lg p-1.5 text-center">
                <span className="text-[#8E7A86] block">ROMANCE</span>
                <span className="text-[#C9A6B8] font-semibold">{vibeData.romance ?? 40}%</span>
              </div>
              <div className="bg-[#211E25] border border-[#2A2630] rounded-lg p-1.5 text-center">
                <span className="text-[#8E7A86] block">NOSTALGIA</span>
                <span className="text-[#B8A7C9] font-semibold">{vibeData.nostalgia ?? 60}%</span>
              </div>
              <div className="bg-[#211E25] border border-[#2A2630] rounded-lg p-1.5 text-center">
                <span className="text-[#8E7A86] block">CINEMATIC</span>
                <span className="text-[#F4EEE7] font-semibold">{vibeData.cinematic ?? 55}%</span>
              </div>
            </div>

            {/* Extracted Color Palette */}
            {vibeData.palette && vibeData.palette.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono-accent text-[#8E7A86] uppercase">Palette:</span>
                <div className="flex items-center gap-1">
                  {vibeData.palette.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-[#17151A]/60 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.hex})`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick 1-Tap Direct Social Sharing Bar with #1 Ranked Match */}
            {songs.length > 0 && (
              <div className="pt-2 border-t border-[#2A2630]/70 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono-accent text-[#D8B88C] uppercase flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-[#D8B88C]" />
                  <span>Share top match:</span>
                </span>

                <button
                  id="btn-quick-share-story"
                  type="button"
                  onClick={() => {
                    setSelectedShareSong(songs[0]);
                    setShareAutoTarget('instagram-story');
                  }}
                  className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#833AB4]/30 via-[#FD1D1D]/30 to-[#FCAF45]/30 hover:from-[#833AB4]/50 hover:via-[#FD1D1D]/50 hover:to-[#FCAF45]/50 border border-[#FD1D1D]/40 text-[#F4EEE7] text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  title={`Open Photo & "${songs[0].title}" on Instagram Story`}
                >
                  <Send className="w-3 h-3 text-[#FD1D1D]" />
                  <span>Story</span>
                </button>

                <button
                  id="btn-quick-share-reel"
                  type="button"
                  onClick={() => {
                    setSelectedShareSong(songs[0]);
                    setShareAutoTarget('instagram-reel');
                  }}
                  className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#833AB4]/30 via-[#E1306C]/30 to-[#C13584]/30 hover:from-[#833AB4]/50 hover:via-[#E1306C]/50 hover:to-[#C13584]/50 border border-[#E1306C]/40 text-[#F4EEE7] text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  title={`Open Photo & "${songs[0].title}" as Instagram Reel video`}
                >
                  <Send className="w-3 h-3 text-[#E1306C]" />
                  <span>Reels</span>
                </button>

                <button
                  id="btn-quick-share-post"
                  type="button"
                  onClick={() => {
                    setSelectedShareSong(songs[0]);
                    setShareAutoTarget('instagram-post');
                  }}
                  className="px-2 py-1 rounded-lg bg-[#211E25] hover:bg-[#2A2630] border border-[#2A2630] hover:border-[#B8A7C9]/40 text-[#F4EEE7] text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95"
                  title={`Open Photo & "${songs[0].title}" on Instagram Post (Feed)`}
                >
                  <Send className="w-3 h-3 text-[#B8A7C9]" />
                  <span>Post</span>
                </button>

                <button
                  id="btn-quick-share-whatsapp"
                  type="button"
                  onClick={() => {
                    setSelectedShareSong(songs[0]);
                    setShareAutoTarget('whatsapp-status');
                  }}
                  className="px-2 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#F4EEE7] text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95"
                  title={`Open Photo & "${songs[0].title}" on WhatsApp Status`}
                >
                  <Send className="w-3 h-3 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Manual Vibe Override Drawer */}
        {showVibeSelector && (
          <div className="pt-3 border-t border-[#2A2630] space-y-2 animate-in fade-in duration-200">
            <span className="text-[11px] font-mono-accent text-[#B9AFB7] block">
              Override primary mood to re-score matching candidates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_VIBE_LABELS.map((vLabel) => {
                const isSelected = activeMood === vLabel;
                return (
                  <button
                    key={vLabel}
                    id={`btn-override-vibe-${vLabel.toLowerCase()}`}
                    type="button"
                    onClick={() => onOverrideVibe(vLabel)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#D8B88C] text-[#17151A] font-bold shadow-sm'
                        : 'bg-[#211E25] text-[#B9AFB7] hover:text-[#F4EEE7] hover:bg-[#2A2630] border border-[#2A2630]'
                    }`}
                  >
                    {vLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tone Refinement Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#B9AFB7]">
          <span className="font-mono-accent uppercase text-[10px] tracking-wider text-[#8E7A86]">
            Refine Soundtrack Atmosphere:
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TONE_ADJUSTMENTS.map(({ label, tone }) => (
            <button
              key={tone}
              id={`btn-tone-${tone}`}
              type="button"
              onClick={() => onToneRefine(tone)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#211E25] hover:bg-[#2A2630] text-[#B9AFB7] hover:text-[#F4EEE7] border border-[#2A2630] whitespace-nowrap transition-colors flex-shrink-0"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Matching Songs Showcase Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2A2630] border border-[#D8B88C]/30 flex items-center justify-center">
              <Music className="w-3.5 h-3.5 text-[#D8B88C]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#F4EEE7] leading-tight">
                Recommended Soundtrack
              </h3>
              <p className="text-[11px] text-[#B9AFB7]">
                Top 5 ranked tracks matching mood, pacing & destination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#211E25] border border-[#2A2630] text-[#B8A7C9] text-[10px] font-mono-accent">
              {selectedLanguage}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#2A2630] border border-[#D8B88C]/30 text-[#D8B88C] text-[10px] font-mono-accent font-semibold">
              Top 5 Matches
            </span>
          </div>
        </div>

        {/* Exactly 5 Songs List */}
        <div className="space-y-3">
          {songs.map((song, index) => {
            const isPlayingThis = playback.isPlaying && playback.activeSongId === song.id;
            const isLoadingThis = playback.isLoading && playback.activeSongId === song.id;
            const hasPreview = !!song.previewUrl;
            const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(
              `${song.artist} ${song.title}`
            )}`;

            return (
              <div
                key={song.id}
                id={`card-song-recommendation-${index + 1}`}
                className={`relative rounded-2xl p-4 transition-all border ${
                  isPlayingThis
                    ? 'bg-[#2A2630] border-[#D8B88C]/70 shadow-lg ring-1 ring-[#D8B88C]/30'
                    : 'brand-surface hover:border-[#C9A6B8]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3.5">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Song Number & Play Button: Guaranteed In-App Playback for ALL songs */}
                    <div className="relative flex-shrink-0 pt-0.5 flex flex-col items-center">
                      <button
                        id={`btn-play-song-${index + 1}`}
                        type="button"
                        onClick={() => handleTogglePlay(song)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          isPlayingThis
                            ? 'bg-[#D8B88C] text-[#17151A] shadow-md ring-2 ring-[#D8B88C]/50'
                            : 'bg-[#2A2630] text-[#F4EEE7] hover:bg-[#342F3D] hover:text-[#D8B88C] border border-[#2A2630]'
                        }`}
                        title={isPlayingThis ? 'Pause in-app audio' : 'Play in-app audio preview'}
                        aria-label={`${isPlayingThis ? 'Pause' : 'Play'} ${song.title}`}
                      >
                        {isLoadingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#D8B88C]" />
                        ) : isPlayingThis ? (
                          <Pause className="w-4 h-4 fill-[#17151A]" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#17151A] border border-[#2A2630] text-[9px] font-mono-accent text-[#B9AFB7] flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>

                    {/* Song Metadata & Why It Fits */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-display font-bold text-sm sm:text-base text-[#F4EEE7] truncate">
                            {song.title}
                          </h4>
                          {isPlayingThis && (
                            <span className="flex items-end gap-0.5 h-3 flex-shrink-0">
                              <span className="w-0.5 h-full bg-[#D8B88C] animate-[bounce_0.8s_infinite]" />
                              <span className="w-0.5 h-2/3 bg-[#D8B88C] animate-[bounce_0.6s_infinite]" />
                              <span className="w-0.5 h-4/5 bg-[#D8B88C] animate-[bounce_0.9s_infinite]" />
                            </span>
                          )}
                        </div>

                        {/* Match Score Badge */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#211E25] border border-[#D8B88C]/30 text-[#D8B88C] text-[10px] font-mono-accent font-semibold flex-shrink-0">
                          <Zap className="w-3 h-3" />
                          <span>{song.matchScore || 94}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#B9AFB7] truncate font-medium mt-0.5">
                        {song.artist}{' '}
                        <span className="text-[#8E7A86] font-normal">
                          • {song.genre} ({song.bpm || song.tempo || 100} BPM)
                        </span>
                      </p>

                      {/* Metadata tags */}
                      <div className="flex items-center flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#211E25] border border-[#2A2630] text-[#D8B88C] text-[10px] font-mono-accent uppercase font-semibold">
                          {song.language}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#211E25] border border-[#C9A6B8]/30 text-[#C9A6B8] text-[10px] font-medium">
                          {song.mood}
                        </span>
                        {song.vibeTags.slice(0, 2).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] text-[#8E7A86] hidden sm:inline">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Active In-App Audio Playback Progress Indicator */}
                      {isPlayingThis && (
                        <div className="mt-2.5 pt-2 border-t border-[#2A2630]/60 space-y-1 animate-in fade-in duration-200">
                          <div
                            className="w-full h-1.5 bg-[#17151A] rounded-full overflow-hidden cursor-pointer relative"
                            onClick={handleSeek}
                            title="Click to seek preview"
                          >
                            <div
                              className="h-full bg-gradient-to-r from-[#D8B88C] to-[#C9A6B8] rounded-full transition-all duration-150"
                              style={{ width: `${playback.progress * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono-accent text-[#B9AFB7]">
                            <span className="text-[#D8B88C] flex items-center gap-1">
                              <Volume2 className="w-3 h-3" />
                              30s Preview Playing
                            </span>
                            <span>
                              {Math.floor(playback.currentTime)}s / {Math.floor(playback.duration)}s
                            </span>
                          </div>
                        </div>
                      )}

                      {/* In-app Audio Preview Status */}
                      <div className="mt-1 text-[10px] font-mono-accent text-[#D8B88C]/80 flex items-center gap-1.5">
                        <Headphones className="w-3 h-3 text-[#D8B88C]" />
                        <span>{isPlayingThis ? 'Playing in-browser audio' : 'In-browser preview ready'}</span>
                      </div>

                      {/* Contextual WHY Match explanation */}
                      {song.matchReason && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-[#211E25]/80 border border-[#2A2630] text-[11px] text-[#B9AFB7] leading-relaxed flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#D8B88C] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#F4EEE7] mr-1">Why it fits:</span>
                            <span>{song.matchReason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Direct 1-Tap Story, Destination Share, Story Mockup & Copy */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2A2630]/60 flex-shrink-0">
                    {/* Direct 1-Tap Instagram Story button for this specific song */}
                    <button
                      id={`btn-song-story-${index + 1}`}
                      type="button"
                      onClick={() => {
                        setSelectedShareSong(song);
                        setShareAutoTarget('instagram-story');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#833AB4]/30 via-[#FD1D1D]/30 to-[#FCAF45]/30 hover:from-[#833AB4]/50 hover:via-[#FD1D1D]/50 hover:to-[#FCAF45]/50 border border-[#FD1D1D]/50 text-[#F4EEE7] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      title={`Open "${song.title}" directly in Instagram Story`}
                    >
                      <Send className="w-3.5 h-3.5 text-[#FD1D1D]" />
                      <span>Story</span>
                    </button>

                    <button
                      id={`btn-share-song-${index + 1}`}
                      type="button"
                      onClick={() => setSelectedShareSong(song)}
                      className="p-2 rounded-xl bg-[#211E25] hover:bg-[#352D3E] border border-[#2A2630] hover:border-[#C9A6B8]/50 text-[#C9A6B8] hover:text-[#F4EEE7] transition-colors"
                      title="Share to Instagram (Story, Post, Reel) or WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-story-preview-${index + 1}`}
                      type="button"
                      onClick={() => setSelectedStorySong(song)}
                      className="p-2 rounded-xl bg-[#211E25] hover:bg-[#2A2630] border border-[#2A2630] text-[#B8A7C9] hover:text-[#F4EEE7] transition-colors"
                      title="Preview Social Mockup"
                    >
                      <Layers className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-copy-song-${index + 1}`}
                      type="button"
                      onClick={() => handleCopy(song)}
                      className="p-2 rounded-xl bg-[#211E25] hover:bg-[#2A2630] border border-[#2A2630] text-[#B9AFB7] hover:text-[#F4EEE7] transition-colors"
                      title="Copy song details"
                    >
                      {copiedSongId === song.id ? (
                        <Check className="w-4 h-4 text-[#D8B88C]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Controls */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {/* "Find 5 more" CTA - guaranteed to fetch new songs and keep Vibe Profile */}
        <button
          id="btn-find-more-songs"
          type="button"
          onClick={onFindMore}
          disabled={isRefreshingMore}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl brand-surface border border-[#C9A6B8]/40 hover:border-[#D8B88C] text-[#F4EEE7] font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#2A2630] active:scale-[0.99] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D8B88C] ${isRefreshingMore ? 'animate-spin' : ''}`} />
          <span>{isRefreshingMore ? 'Filtering new matches...' : 'Find 5 more'}</span>
        </button>

        {/* Start Fresh with another photo */}
        <button
          id="btn-match-another-photo"
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#211E25] hover:bg-[#2A2630] border border-[#2A2630] text-[#B9AFB7] hover:text-[#F4EEE7] text-xs font-medium transition-colors"
        >
          Try Another Photo
        </button>
      </div>

      {/* Developer / Diagnostic Matching Inspector (Section N) */}
      <div className="pt-4 border-t border-[#2A2630]/60">
        <button
          id="btn-toggle-diagnostics"
          type="button"
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="text-xs font-mono-accent text-[#8E7A86] hover:text-[#B8A7C9] flex items-center gap-1.5 transition-colors mx-auto"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{showDebugPanel ? 'Hide Diagnostic Panel' : 'Inspect Matching & Vibe Diagnostics'}</span>
          {showDebugPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showDebugPanel && diagnostics && (
          <div className="mt-3 p-4 rounded-2xl bg-[#17151A] border border-[#2A2630] space-y-3 font-mono-accent text-xs text-[#B9AFB7] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#2A2630] pb-2">
              <span className="text-[#D8B88C] font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Matching Engine Diagnostics
              </span>
              <span className="text-[10px] text-[#8E7A86]">
                Candidates Pool: {diagnostics.candidatePoolCount} / {diagnostics.totalCandidatesConsidered}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-[#8E7A86] block text-[10px] uppercase">Active Vibe Profile:</span>
                <p className="text-[#F4EEE7]">
                  Primary: <span className="text-[#D8B88C]">{diagnostics.photoVibeProfile.primaryVibe}</span> | Secondary: {diagnostics.photoVibeProfile.secondaryVibe}
                </p>
                <p className="text-[#8E7A86] text-[10px] mt-0.5">
                  Energy: {diagnostics.photoVibeProfile.energy} | Softness: {diagnostics.photoVibeProfile.softness} | Nostalgia: {diagnostics.photoVibeProfile.nostalgia} | Cinematic: {diagnostics.photoVibeProfile.cinematic}
                </p>
              </div>

              <div>
                <span className="text-[#8E7A86] block text-[10px] uppercase">Engine State:</span>
                <p>Language Filter: <span className="text-[#C9A6B8]">{diagnostics.languageFilter}</span></p>
                <p>Excluded Song IDs: <span className="text-[#D8B88C]">{diagnostics.excludedSongIdsCount}</span> tracks</p>
              </div>
            </div>

            {/* Score Factor Matrix for Top 5 */}
            <div className="pt-2 border-t border-[#2A2630]">
              <span className="text-[10px] text-[#8E7A86] block mb-1.5 uppercase">
                Score Breakdown per Top 5 Selection:
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="text-[#8E7A86] border-b border-[#2A2630]">
                      <th className="pb-1">Track</th>
                      <th className="pb-1">Final</th>
                      <th className="pb-1">Mood</th>
                      <th className="pb-1">Vector</th>
                      <th className="pb-1">Dest</th>
                      <th className="pb-1">Theme</th>
                      <th className="pb-1">Lang</th>
                      <th className="pb-1">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2630]/40">
                    {diagnostics.topScoringFactors.map((f, i) => (
                      <tr key={i} className="text-[#F4EEE7]">
                        <td className="py-1 truncate max-w-[120px]">{f.title}</td>
                        <td className="py-1 text-[#D8B88C] font-semibold">{f.finalScore}%</td>
                        <td className="py-1">{f.moodScore}</td>
                        <td className="py-1">{f.vectorScore}</td>
                        <td className="py-1">{f.destinationScore}</td>
                        <td className="py-1">{f.themeScore}</td>
                        <td className="py-1">{f.languageScore}</td>
                        <td className="py-1">
                          {f.hasPreview ? (
                            <span className="text-emerald-400">Audio stream</span>
                          ) : (
                            <span className="text-amber-400">Spotify only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Story Stickers Modal */}
      {selectedStorySong && (
        <StoryCardModal
          isOpen={!!selectedStorySong}
          onClose={() => setSelectedStorySong(null)}
          photoUrl={photoUrl}
          song={selectedStorySong}
          destination={selectedDestination}
          vibeData={vibeData}
        />
      )}

      {/* Social Direct Share Modal (Instagram Story, Post, Reel, WhatsApp Status) */}
      {selectedShareSong && (
        <ShareModal
          isOpen={!!selectedShareSong}
          onClose={() => {
            setSelectedShareSong(null);
            setShareAutoTarget(undefined);
          }}
          song={selectedShareSong}
          photoUrl={photoUrl}
          destination={selectedDestination}
          initialTarget={shareAutoTarget}
          autoTrigger={!!shareAutoTarget}
        />
      )}
    </div>
  );
};
