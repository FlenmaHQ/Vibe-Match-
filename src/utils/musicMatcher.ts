import { Song, LanguageOption, DestinationOption, DetectedVibeData, VibeLabel, MatchingDiagnostics } from '../types';
import { getSongsForLanguage, getAll5000Songs } from '../data/multilingualCatalogue';

function generateContextualReason(
  song: Song,
  vibe: DetectedVibeData,
  destination: DestinationOption,
  activePrimary: VibeLabel
): string {
  const lightingPhrase = vibe.lighting ? `${vibe.lighting.toLowerCase()} lighting` : 'visual lighting';
  const tempo = song.tempo || song.bpm || 100;
  const tempoLabel = tempo > 115 ? 'driving energetic pulse' : tempo < 90 ? 'contemplative, intimate pace' : 'steady melodic rhythm';
  const energyDesc = vibe.energy > 65 ? 'high-energy visual intensity' : vibe.energy < 40 ? 'quiet, serene atmosphere' : 'balanced visual warmth';

  if (song.mood === activePrimary) {
    if (destination === 'Reel') {
      return `Aligns with the photo's ${activePrimary.toLowerCase()} aura and ${energyDesc} (${song.energy}% song energy), paced with a ${tempoLabel} that cuts naturally to short-form video.`;
    }
    if (destination === 'Instagram Story') {
      return `Harmonizes with the ${lightingPhrase} and ${activePrimary.toLowerCase()} mood, creating an ambient emotional loop for your 15-second story.`;
    }
    return `Directly echoes the ${activePrimary.toLowerCase()} aesthetic with ${song.genre} textures and lyrical themes of ${song.lyricalThemes.slice(0, 2).join(' & ')}.`;
  }

  if (song.secondaryMood === vibe.secondaryVibe || song.secondaryMood === activePrimary) {
    return `Complements the photo's ${vibe.secondaryVibe.toLowerCase()} undertones with ${song.genre} instrumentation and a ${tempoLabel}.`;
  }

  return `Bridges the ${lightingPhrase} with ${song.genre} acoustics, offering an evocative soundtrack for ${destination}.`;
}

export interface MatchSoundtrackResult {
  songs: Song[];
  diagnostics: MatchingDiagnostics;
}

export function matchSoundtrackWithDiagnostics(
  vibe: DetectedVibeData,
  language: LanguageOption,
  destination: DestinationOption,
  customVibeOverride?: VibeLabel,
  excludeSongIds: string[] = []
): MatchSoundtrackResult {
  const activePrimary = customVibeOverride || vibe.primaryVibe;
  const activeSecondary = vibe.secondaryVibe;
  const secondaryVibesList = vibe.secondaryVibes || [activeSecondary];

  // 1. Language candidate filtering (50 songs per language from 100-language catalogue)
  const isAllLanguages = !language || language === 'All Languages';
  const pool: Song[] = isAllLanguages ? getAll5000Songs() : getSongsForLanguage(language);

  // 2. Exclusion filtering for "Find 5 more"
  const candidatePool = pool.filter((s) => !excludeSongIds.includes(s.id));
  const activePool = candidatePool.length >= 5 ? candidatePool : pool;

  // 3. Multi-Factor Vector Scoring
  const photoEnergy = vibe.energy ?? 50;
  const photoSoftness = vibe.softness ?? 50;
  const photoNostalgia = vibe.nostalgia ?? 50;
  const photoRomance = vibe.romance ?? 50;
  const photoCinematic = vibe.cinematic ?? 50;
  const photoConfidence = vibe.confidence ?? 50;
  const photoDarkness = vibe.darkness ?? 50;

  const scored = activePool.map((song) => {
    // A. Visual Mood Alignment (up to 30 pts)
    let moodScore = 0;
    if (song.mood === activePrimary) {
      moodScore = 28;
    } else if (song.secondaryMood === activePrimary) {
      moodScore = 20;
    } else if (secondaryVibesList.includes(song.mood)) {
      moodScore = 15;
    } else if (song.secondaryMood && secondaryVibesList.includes(song.secondaryMood)) {
      moodScore = 11;
    } else if (song.vibeTags.some((t) => t.toLowerCase() === activePrimary.toLowerCase())) {
      moodScore = 10;
    } else {
      // Meaningful penalty for mismatched mood
      moodScore = 4;
    }

    // B. Multi-Dimensional Vector Compatibility (up to 40 pts)
    const dEnergy = Math.abs(photoEnergy - song.energy);
    const dRomance = Math.abs(photoRomance - song.romanceScore);
    const dNostalgia = Math.abs(photoNostalgia - song.nostalgiaScore);
    const dCinematic = Math.abs(photoCinematic - song.cinematicScore);
    const dConfidence = Math.abs(photoConfidence - song.confidenceScore);
    const dDarkness = Math.abs(photoDarkness - song.darknessScore);
    const dSoftness = Math.abs(photoSoftness - song.peacefulScore);

    // Adaptive weighting: prioritize dimensions that define the photo's distinct personality
    const rWeight = photoRomance > 60 ? 2.0 : 1.0;
    const nWeight = photoNostalgia > 60 ? 1.8 : 1.0;
    const eWeight = 1.6; // energy always matters heavily for vibe mismatch
    const cWeight = photoCinematic > 60 ? 1.6 : 1.0;
    const sWeight = photoSoftness > 60 ? 1.5 : 1.0;

    const totalWeight = rWeight + nWeight + eWeight + cWeight + sWeight + 0.8 + 0.8;
    const weightedDiff = (
      dRomance * rWeight +
      dNostalgia * nWeight +
      dEnergy * eWeight +
      dCinematic * cWeight +
      dSoftness * sWeight +
      dConfidence * 0.8 +
      dDarkness * 0.8
    ) / totalWeight;

    // Vector similarity score from 0 to 40 pts (scales down sharply on noticeable differences)
    const vectorScore = Math.max(0, Math.round((1 - weightedDiff / 75) * 40));

    // C. Pacing, Tempo & Destination (up to 15 pts)
    let destinationScore = 0;
    const songTempo = song.tempo || song.bpm || 100;

    if (photoEnergy > 65) {
      if (songTempo >= 105 || song.danceScore > 70) destinationScore += 9;
      else destinationScore += 4;
    } else if (photoEnergy < 40) {
      if (songTempo <= 95 || song.peacefulScore > 75) destinationScore += 9;
      else destinationScore += 4;
    } else {
      if (songTempo >= 80 && songTempo <= 120) destinationScore += 9;
      else destinationScore += 4;
    }

    if (destination === 'Reel' && (songTempo >= 100 || song.danceScore > 65)) {
      destinationScore = Math.min(15, destinationScore + 6);
    } else if (destination === 'Instagram Story' && (song.peacefulScore > 65 || song.cinematicScore > 70)) {
      destinationScore = Math.min(15, destinationScore + 6);
    } else if (destination === 'Instagram Post' && (song.nostalgiaScore > 60 || song.romanceScore > 60)) {
      destinationScore = Math.min(15, destinationScore + 6);
    } else if (destination === 'WhatsApp Status' && (song.peacefulScore > 60 || song.mood === 'Friendship')) {
      destinationScore = Math.min(15, destinationScore + 6);
    } else {
      destinationScore = Math.min(15, destinationScore + 3);
    }

    // D. Lyrical Theme & Visual Style overlap (up to 10 pts)
    let themeScore = 0;
    const descText = `${vibe.visualStyle || ''} ${vibe.aestheticDescriptor || ''} ${vibe.description || ''}`.toLowerCase();
    const tagMatchCount = song.vibeTags.filter((t) => descText.includes(t.toLowerCase())).length;
    const themeMatchCount = song.lyricalThemes.filter((lt) => descText.includes(lt.toLowerCase())).length;
    themeScore = Math.min(10, 3 + tagMatchCount * 2 + themeMatchCount * 2);

    // E. Language score (up to 5 pts)
    let languageScore = 5;
    if (!isAllLanguages) {
      if (song.language.toLowerCase().includes(language.toLowerCase())) {
        languageScore = 5;
      } else {
        languageScore = 1;
      }
    }

    // Dynamic, mathematically sound total match score (no artificial 94% clamp)
    const rawTotal = moodScore + vectorScore + destinationScore + themeScore + languageScore;
    const matchScore = Math.min(95, Math.max(45, rawTotal));

    const enrichedSong: Song = {
      ...song,
      matchScore,
      matchReason: generateContextualReason(song, vibe, destination, activePrimary),
      scoreBreakdown: {
        moodScore,
        vectorScore,
        destinationScore,
        themeScore,
        languageScore,
      },
    };

    return { song: enrichedSong, score: matchScore };
  });

  // Sort candidates by match score descending
  scored.sort((a, b) => b.score - a.score);

  // G. DIVERSITY IN TOP 5:
  // - avoid duplicate songs
  // - avoid duplicate artists in top 5
  // - diversify genres where possible
  const topFive: Song[] = [];
  const seenSongIds = new Set<string>();
  const seenArtists = new Set<string>();

  for (const item of scored) {
    const s = item.song;
    if (seenSongIds.has(s.id)) continue;

    // Prioritize distinct artists
    if (seenArtists.has(s.artist) && topFive.length < 4 && scored.length > 8) {
      continue;
    }

    seenSongIds.add(s.id);
    seenArtists.add(s.artist);
    topFive.push(s);

    if (topFive.length === 5) break;
  }

  // Fallback: fill up to 5 if needed
  if (topFive.length < 5) {
    for (const item of scored) {
      if (!seenSongIds.has(item.song.id)) {
        seenSongIds.add(item.song.id);
        topFive.push(item.song);
      }
      if (topFive.length === 5) break;
    }
  }

  const finalTopFive = topFive.slice(0, 5);

  const diagnostics: MatchingDiagnostics = {
    photoVibeProfile: {
      primaryVibe: vibe.primaryVibe,
      secondaryVibe: vibe.secondaryVibe,
      secondaryVibes: vibe.secondaryVibes,
      energy: vibe.energy,
      softness: vibe.softness,
      nostalgia: vibe.nostalgia,
      romance: vibe.romance,
      cinematic: vibe.cinematic,
      confidence: vibe.confidence,
      darkness: vibe.darkness,
      visualStyle: vibe.visualStyle,
      lighting: vibe.lighting,
      energyLevel: vibe.energyLevel,
    },
    totalCandidatesConsidered: pool.length,
    languageFilter: language,
    excludedSongIdsCount: excludeSongIds.length,
    excludedSongIds: excludeSongIds,
    candidatePoolCount: activePool.length,
    rankedCandidatesCount: scored.length,
    topScoringFactors: finalTopFive.map((s) => ({
      songId: s.id,
      title: s.title,
      artist: s.artist,
      finalScore: s.matchScore || 0,
      moodScore: s.scoreBreakdown?.moodScore || 0,
      vectorScore: s.scoreBreakdown?.vectorScore || 0,
      destinationScore: s.scoreBreakdown?.destinationScore || 0,
      themeScore: s.scoreBreakdown?.themeScore || 0,
      languageScore: s.scoreBreakdown?.languageScore || 0,
      hasPreview: !!s.previewUrl,
    })),
  };

  return { songs: finalTopFive, diagnostics };
}

// Keep standard matchSoundtrack signature for backwards compatibility
export function matchSoundtrack(
  vibe: DetectedVibeData,
  language: LanguageOption,
  destination: DestinationOption,
  customVibeOverride?: VibeLabel,
  excludeSongIds: string[] = []
): Song[] {
  return matchSoundtrackWithDiagnostics(vibe, language, destination, customVibeOverride, excludeSongIds).songs;
}
