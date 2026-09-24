import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { PreferenceControls } from './components/PreferenceControls';
import { MatchingTransition } from './components/MatchingTransition';
import { ResultsView } from './components/ResultsView';
import { LanguageOption, DestinationOption, DetectedVibeData, Song, VibeLabel, MatchingDiagnostics } from './types';
import { analyzePhotoVibe } from './utils/vibeAnalyzer';
import { matchSoundtrackWithDiagnostics } from './utils/musicMatcher';
import { audioPlayerService } from './utils/audioPlayerService';

export default function App() {
  const defaultPhoto = `${import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`}vintage_mirror_photo.jpg`;
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultPhoto);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('All Languages');
  const [selectedDestination, setSelectedDestination] = useState<DestinationOption>('Instagram Story');
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [vibeData, setVibeData] = useState<DetectedVibeData | null>(null);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [activeVibeOverride, setActiveVibeOverride] = useState<VibeLabel | undefined>(undefined);
  const [seenSongIds, setSeenSongIds] = useState<string[]>([]);
  const [isRefreshingMore, setIsRefreshingMore] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<MatchingDiagnostics | null>(null);

  // Analyze image when photo changes
  useEffect(() => {
    if (photoUrl) {
      analyzePhotoVibe(photoUrl).then((detected) => {
        setVibeData(detected);
      });
    } else {
      setVibeData(null);
      setActiveVibeOverride(undefined);
      setSeenSongIds([]);
      setDiagnostics(null);
    }
  }, [photoUrl]);

  const handleStartMatching = async () => {
    if (!photoUrl) return;

    audioPlayerService.stop();
    setIsMatching(true);
    setShowResults(false);

    // Compute or ensure vibe data is ready
    let currentVibe = vibeData;
    if (!currentVibe) {
      currentVibe = await analyzePhotoVibe(photoUrl);
      setVibeData(currentVibe);
    }

    const result = matchSoundtrackWithDiagnostics(
      currentVibe,
      selectedLanguage,
      selectedDestination,
      activeVibeOverride,
      []
    );
    setRecommendedSongs(result.songs);
    setDiagnostics(result.diagnostics);
    setSeenSongIds(result.songs.map((s) => s.id));
  };

  const handleTransitionComplete = () => {
    setIsMatching(false);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOverrideVibe = (newVibe: VibeLabel) => {
    setActiveVibeOverride(newVibe);
    if (vibeData) {
      const result = matchSoundtrackWithDiagnostics(
        vibeData,
        selectedLanguage,
        selectedDestination,
        newVibe,
        []
      );
      setRecommendedSongs(result.songs);
      setDiagnostics(result.diagnostics);
      setSeenSongIds(result.songs.map((s) => s.id));
    }
  };

  const handleFindMore = () => {
    if (!vibeData) return;
    setIsRefreshingMore(true);
    audioPlayerService.stop();

    setTimeout(() => {
      // Exclude already seen songs to fetch 5 new ones while strictly maintaining Vibe Profile
      const result = matchSoundtrackWithDiagnostics(
        vibeData,
        selectedLanguage,
        selectedDestination,
        activeVibeOverride,
        seenSongIds
      );

      const newIds = result.songs.map((s) => s.id);
      // Reset cycle if catalogue for that filter is exhausted
      if (seenSongIds.length > 50) {
        setSeenSongIds(newIds);
      } else {
        setSeenSongIds((prev) => [...prev, ...newIds]);
      }

      setRecommendedSongs(result.songs);
      setDiagnostics(result.diagnostics);
      setIsRefreshingMore(false);
    }, 400);
  };

  const handleToneRefine = (toneType: 'upbeat' | 'chill' | 'acoustic' | 'cinematic' | 'dark' | 'dreamy') => {
    if (!vibeData) return;
    audioPlayerService.stop();

    // Map audio tone to appropriate vibe label
    let toneToVibe: VibeLabel = 'Dreamy';
    if (toneType === 'upbeat') toneToVibe = 'Energetic';
    else if (toneType === 'chill') toneToVibe = 'Peaceful';
    else if (toneType === 'acoustic') toneToVibe = 'Nostalgic';
    else if (toneType === 'cinematic') toneToVibe = 'Cinematic';
    else if (toneType === 'dark') toneToVibe = 'Dark';
    else if (toneType === 'dreamy') toneToVibe = 'Dreamy';

    setActiveVibeOverride(toneToVibe);
    const result = matchSoundtrackWithDiagnostics(
      vibeData,
      selectedLanguage,
      selectedDestination,
      toneToVibe,
      []
    );
    setRecommendedSongs(result.songs);
    setDiagnostics(result.diagnostics);
    setSeenSongIds(result.songs.map((s) => s.id));
  };

  const handleReset = () => {
    audioPlayerService.stop();
    setShowResults(false);
    setIsMatching(false);
    setActiveVibeOverride(undefined);
    setSeenSongIds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearImage = () => {
    audioPlayerService.stop();
    setPhotoUrl(null);
    setVibeData(null);
    setShowResults(false);
    setIsMatching(false);
    setActiveVibeOverride(undefined);
    setSeenSongIds([]);
    setDiagnostics(null);
  };

  return (
    <div className="min-h-screen bg-[#17151A] bg-noise text-[#F4EEE7] flex flex-col selection:bg-[#D8B88C] selection:text-[#17151A]">
      {/* Editorial ambient light blooms */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[550px] h-[280px] bg-[#C9A6B8]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="fixed top-36 right-0 w-[320px] h-[320px] bg-[#D8B88C]/10 blur-[110px] pointer-events-none rounded-full" />

      {/* Persistent App Header */}
      <Header onReset={handleReset} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col justify-start">
        {isMatching ? (
          /* Animated Matching Transition */
          <div className="my-auto py-8">
            <MatchingTransition
              photoUrl={photoUrl || ''}
              vibeData={vibeData}
              onComplete={handleTransitionComplete}
            />
          </div>
        ) : showResults && vibeData ? (
          /* Results View with 5 Songs */
          <ResultsView
            photoUrl={photoUrl || ''}
            vibeData={vibeData}
            songs={recommendedSongs}
            selectedLanguage={selectedLanguage}
            selectedDestination={selectedDestination}
            onReset={handleReset}
            onOverrideVibe={handleOverrideVibe}
            onFindMore={handleFindMore}
            onToneRefine={handleToneRefine}
            activeVibeOverride={activeVibeOverride}
            isRefreshingMore={isRefreshingMore}
            diagnostics={diagnostics}
          />
        ) : (
          /* Home / Upload & Config View */
          <div className="space-y-6 animate-in fade-in duration-300">
            <PhotoUploader
              selectedImage={photoUrl}
              onImageSelected={(url) => setPhotoUrl(url)}
              onClearImage={handleClearImage}
            />

            <PreferenceControls
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              selectedDestination={selectedDestination}
              onSelectDestination={setSelectedDestination}
              onMatch={handleStartMatching}
              hasPhoto={!!photoUrl}
            />
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full border-t border-[#2A2630] py-5 text-center text-xs text-[#B9AFB7]">
        <div className="max-w-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono-accent text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D8B88C]" />
            <span className="text-[#F4EEE7] font-semibold">VIBE MATCH</span>
            <span className="text-[#8E7A86]">— Visual Soundtrack Engine</span>
          </div>

          <div className="flex items-center gap-3 text-[#8E7A86]">
            <span>Stories • Posts • Reels</span>
            <span>•</span>
            <span className="text-[#C9A6B8]">Verified Audio Catalogue</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
