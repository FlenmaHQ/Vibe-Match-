import React, { useState, useMemo } from 'react';
import { Globe2, Sparkles, ArrowRight, ChevronDown, Check, Search, Filter, Music2, ShieldCheck, X } from 'lucide-react';
import { LanguageOption, DestinationOption } from '../types';
import { TOP_100_LANGUAGES, LanguageInfo } from '../data/languages';
import { getAll5000Songs } from '../data/multilingualCatalogue';

interface PreferenceControlsProps {
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  selectedDestination: DestinationOption;
  onSelectDestination: (dest: DestinationOption) => void;
  onMatch: () => void;
  hasPhoto: boolean;
}

const DESTINATIONS: { label: DestinationOption; badge: string; desc: string }[] = [
  { label: 'Instagram Story', badge: '9:16', desc: '15s dynamic loop' },
  { label: 'Instagram Post', badge: '1:1', desc: 'Aesthetic photo vibe' },
  { label: 'Reel', badge: 'Shorts', desc: 'High-energy cuts' },
  { label: 'WhatsApp Status', badge: 'Status', desc: 'Intimate melody' },
  { label: 'Other', badge: 'Audio', desc: 'Full soundtrack' },
];

// Curated high-frequency languages for direct chips
const POPULAR_QUICK_LANGUAGES = [
  'All Languages',
  'English',
  'Hindi',
  'Telugu',
  'Spanish',
  'Korean',
  'Japanese',
  'Tamil',
  'French',
  'Punjabi',
  'Portuguese',
  'Arabic',
];

type RegionFilter = 'all' | 'popular' | 'asia' | 'europe' | 'americas' | 'mideast_africa';

export const PreferenceControls: React.FC<PreferenceControlsProps> = ({
  selectedLanguage,
  onSelectLanguage,
  selectedDestination,
  onSelectDestination,
  onMatch,
  hasPhoto,
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('all');

  // Filter languages based on search query and region
  const filteredLanguages = useMemo(() => {
    const q = languageSearch.toLowerCase().trim();

    return TOP_100_LANGUAGES.filter((lang) => {
      // Search match
      const matchesSearch =
        !q ||
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q) ||
        lang.genres.some((g: string) => g.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Region filter
      if (activeRegion === 'all') return true;
      if (activeRegion === 'popular') return lang.region === 'Global / Popular';
      if (activeRegion === 'asia') return lang.region.includes('Asia') || lang.region.includes('India');
      if (activeRegion === 'europe') return lang.region.includes('Europe');
      if (activeRegion === 'americas') return lang.region.includes('America');
      if (activeRegion === 'mideast_africa') return lang.region.includes('Middle East') || lang.region.includes('Africa');

      return true;
    });
  }, [languageSearch, activeRegion]);

  return (
    <div className="w-full space-y-5">
      {/* 1. Language Preference Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#B9AFB7] uppercase tracking-wider font-mono-accent">
            <Globe2 className="w-3.5 h-3.5 text-[#D8B88C]" />
            Music Language Preference
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#D8B88C] font-mono-accent font-semibold">
              {selectedLanguage}
            </span>
            <span className="text-[10px] text-[#8E7A86] font-mono-accent bg-[#211E25] px-2 py-0.5 rounded-full border border-[#2A2630]">
              {selectedLanguage === 'All Languages' ? '5,000 songs' : '50 songs'}
            </span>
          </div>
        </div>

        {/* Primary Language Preferences Modal Button */}
        <button
          id="btn-language-preferences-modal"
          type="button"
          onClick={() => setShowLanguageModal(true)}
          className="w-full group px-4 py-3 rounded-2xl bg-gradient-to-r from-[#211E25] via-[#2A2630] to-[#211E25] hover:from-[#2A2630] hover:to-[#2A2630] border border-[#D8B88C]/40 hover:border-[#D8B88C] text-[#F4EEE7] transition-all flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D8B88C]/15 border border-[#D8B88C]/30 flex items-center justify-center text-[#D8B88C]">
              <Globe2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F4EEE7]">
                  Language Preferences
                </span>
                <span className="text-[10px] font-mono-accent text-[#D8B88C] bg-[#D8B88C]/10 px-2 py-0.5 rounded-full border border-[#D8B88C]/20 font-semibold">
                  100 Languages • 50 Music in Each
                </span>
              </div>
              <p className="text-[11px] text-[#B9AFB7]">
                Currently selected: <span className="text-[#D8B88C] font-semibold">{selectedLanguage}</span> ({selectedLanguage === 'All Languages' ? '5,000 tracks' : '50 tracks'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#D8B88C] font-medium group-hover:translate-x-0.5 transition-transform">
            <span>Browse All 100</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {/* Quick Language Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {POPULAR_QUICK_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang;
            const songCount = lang === 'All Languages' ? '5,000' : '50';

            return (
              <button
                key={lang}
                id={`btn-lang-${lang.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => onSelectLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2A2630] text-[#D8B88C] border border-[#D8B88C]/70 shadow-sm font-semibold ring-1 ring-[#D8B88C]/20'
                    : 'bg-[#211E25] text-[#B9AFB7] hover:text-[#F4EEE7] hover:bg-[#2A2630] border border-[#2A2630]'
                }`}
              >
                <span>{lang}</span>
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono-accent ${
                    isSelected
                      ? 'bg-[#D8B88C]/20 text-[#D8B88C]'
                      : 'bg-[#17151A] text-[#8E7A86]'
                  }`}
                >
                  {songCount}
                </span>
              </button>
            );
          })}

          <button
            id="btn-quick-more-languages"
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#211E25] text-[#D8B88C] hover:bg-[#2A2630] border border-[#D8B88C]/30 inline-flex items-center gap-1 transition-colors"
          >
            <span>More (100 Languages)</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Destination Platform Selection */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#B9AFB7] uppercase tracking-wider font-mono-accent">
          <Sparkles className="w-3.5 h-3.5 text-[#B8A7C9]" />
          Platform Destination
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DESTINATIONS.map(({ label, badge, desc }) => {
            const isSelected = selectedDestination === label;
            return (
              <button
                key={label}
                id={`btn-dest-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => onSelectDestination(label)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-[#2A2630] border-[#D8B88C]/70 shadow-sm'
                    : 'bg-[#211E25] border-[#2A2630] hover:bg-[#2A2630]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9.5px] font-mono-accent px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-[#D8B88C]/20 text-[#D8B88C] font-semibold'
                        : 'bg-[#17151A] text-[#8E7A86]'
                    }`}
                  >
                    {badge}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-[#D8B88C]" />}
                </div>
                <div
                  className={`text-xs font-semibold truncate ${
                    isSelected ? 'text-[#F4EEE7]' : 'text-[#B9AFB7]'
                  }`}
                >
                  {label}
                </div>
                <div className="text-[10px] text-[#8E7A86] truncate mt-0.5">{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Action CTA Button */}
      <div className="pt-2">
        <button
          id="btn-match-music"
          type="button"
          disabled={!hasPhoto}
          onClick={onMatch}
          className={`w-full py-3.5 px-6 rounded-2xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg ${
            hasPhoto
              ? 'bg-[#D8B88C] text-[#17151A] hover:bg-[#E2C7A3] active:scale-[0.99] shadow-[#D8B88C]/15 cursor-pointer'
              : 'bg-[#2A2630] text-[#8E7A86] border border-[#2A2630] cursor-not-allowed'
          }`}
        >
          <Music2 className="w-4 h-4" />
          <span>Match the Music</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 100 Languages Preferences Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#1D1A22] border border-[#2A2630] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2A2630] flex items-center justify-between bg-[#211E25]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D8B88C]/15 border border-[#D8B88C]/30 flex items-center justify-center text-[#D8B88C]">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#F4EEE7] flex items-center gap-2">
                    Language Preferences
                    <span className="text-xs font-mono-accent text-[#D8B88C] bg-[#D8B88C]/15 px-2 py-0.5 rounded-full border border-[#D8B88C]/30">
                      100 Languages • 50 Music in Each
                    </span>
                  </h3>
                  <p className="text-xs text-[#B9AFB7] mt-0.5">
                    Select your preferred soundtrack language. Every language contains 50 verified, vibe-matched tracks.
                  </p>
                </div>
              </div>

              <button
                id="btn-close-language-modal"
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="w-8 h-8 rounded-full bg-[#17151A] text-[#B9AFB7] hover:text-[#F4EEE7] hover:bg-[#2A2630] flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Region Filter Bar */}
            <div className="p-4 border-b border-[#2A2630] bg-[#17151A]/60 space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8E7A86] absolute left-3.5 top-3" />
                <input
                  id="input-search-100-languages"
                  type="text"
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  placeholder="Search any of 100 languages (e.g. Telugu, Japanese, French, Swahili, Spanish, Tamil...)"
                  className="w-full bg-[#1D1A22] border border-[#2A2630] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F4EEE7] placeholder-[#8E7A86] focus:outline-none focus:border-[#D8B88C]"
                />
                {languageSearch && (
                  <button
                    type="button"
                    onClick={() => setLanguageSearch('')}
                    className="absolute right-3 top-2.5 text-[#8E7A86] hover:text-[#F4EEE7] text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Region Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: `All (100)` },
                  { id: 'popular', label: 'Popular (15)' },
                  { id: 'asia', label: 'Asia & South Asia' },
                  { id: 'europe', label: 'Europe' },
                  { id: 'americas', label: 'Americas' },
                  { id: 'mideast_africa', label: 'Middle East & Africa' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    id={`btn-filter-region-${id}`}
                    type="button"
                    onClick={() => setActiveRegion(id as RegionFilter)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                      activeRegion === id
                        ? 'bg-[#D8B88C] text-[#17151A] font-bold shadow-sm'
                        : 'bg-[#211E25] text-[#B9AFB7] hover:text-[#F4EEE7] hover:bg-[#2A2630] border border-[#2A2630]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 100 Languages Grid / List */}
            <div className="overflow-y-auto flex-1 p-4">
              {/* Option 0: All Languages (Global 5,000) */}
              {(!languageSearch || 'all languages'.includes(languageSearch.toLowerCase())) && activeRegion === 'all' && (
                <button
                  id="btn-select-all-languages"
                  type="button"
                  onClick={() => {
                    onSelectLanguage('All Languages');
                    setShowLanguageModal(false);
                  }}
                  className={`w-full p-3 mb-3 rounded-2xl text-left flex items-center justify-between border transition-all ${
                    selectedLanguage === 'All Languages'
                      ? 'bg-[#2A2630] border-[#D8B88C] shadow-md ring-1 ring-[#D8B88C]/30'
                      : 'bg-[#211E25] border-[#2A2630] hover:border-[#D8B88C]/50 hover:bg-[#2A2630]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F4EEE7]">All Languages</span>
                        <span className="text-[10px] text-[#B8A7C9] font-mono-accent bg-[#2A2630] px-2 py-0.5 rounded-full border border-[#2A2630]">
                          Global Cross-Cultural
                        </span>
                      </div>
                      <p className="text-[11px] text-[#B9AFB7] mt-0.5">
                        Matches across all 100 languages simultaneously for the absolute best musical fit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-accent text-[#D8B88C] bg-[#D8B88C]/15 px-2.5 py-1 rounded-full border border-[#D8B88C]/30 font-semibold">
                      5,000 Songs Total
                    </span>
                    {selectedLanguage === 'All Languages' && (
                      <div className="w-5 h-5 rounded-full bg-[#D8B88C] text-[#17151A] flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              )}

              {/* 100 Individual Language Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredLanguages.map((lang: LanguageInfo) => {
                  const isSelected = selectedLanguage === lang.name;

                  return (
                    <button
                      key={lang.code}
                      id={`btn-select-lang-${lang.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      type="button"
                      onClick={() => {
                        onSelectLanguage(lang.name);
                        setShowLanguageModal(false);
                      }}
                      className={`p-3 rounded-xl text-left flex items-center justify-between border transition-all ${
                        isSelected
                          ? 'bg-[#2A2630] border-[#D8B88C] shadow-sm ring-1 ring-[#D8B88C]/30'
                          : 'bg-[#211E25] border-[#2A2630] hover:border-[#D8B88C]/50 hover:bg-[#2A2630]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl flex-shrink-0">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#D8B88C]' : 'text-[#F4EEE7]'}`}>
                              {lang.name}
                            </span>
                            <span className="text-[11px] text-[#8E7A86] truncate">
                              ({lang.nativeName})
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8E7A86] truncate">
                            {lang.region} • {lang.genres[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-[10px] font-mono-accent text-[#D8B88C] bg-[#D8B88C]/10 px-2 py-0.5 rounded-full border border-[#D8B88C]/20 font-semibold">
                          50 Music
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#D8B88C] text-[#17151A] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredLanguages.length === 0 && (
                <div className="py-12 text-center text-[#8E7A86]">
                  <p className="text-sm">No languages found matching "{languageSearch}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguageSearch('');
                      setActiveRegion('all');
                    }}
                    className="mt-2 text-xs text-[#D8B88C] underline"
                  >
                    Clear search and show all 100 languages
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2A2630] bg-[#211E25] flex items-center justify-between text-xs">
              <span className="text-[#8E7A86] font-mono-accent">
                Showing {filteredLanguages.length} of 100 Languages • 50 Music Tracks in Each
              </span>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2A2630] text-[#F4EEE7] hover:bg-[#342F3C] font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
