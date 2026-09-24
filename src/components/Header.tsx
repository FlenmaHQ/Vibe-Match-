import React, { useEffect, useState } from 'react';
import { Aperture, AudioWaveform, Volume2 } from 'lucide-react';
import { audioPlayer } from '../utils/audioSynthesizer';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioPlayer.subscribe((playing) => {
      setIsPlaying(playing);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#17151A]/90 border-b border-[#2A2630] transition-all">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Abstract Lens + Sound Wave Brand Logo */}
        <button
          id="btn-header-home"
          onClick={onReset}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#211E25] border border-[#2A2630] p-1.5 shadow-md group-hover:border-[#C9A6B8]/50 transition-all">
            {/* Outer Lens Aperture with inner Sound Wave */}
            <Aperture className="w-5 h-5 text-[#D8B88C] transition-transform duration-500 group-hover:rotate-45" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AudioWaveform className={`w-3.5 h-3.5 text-[#C9A6B8] ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D8B88C] shadow-sm animate-pulse" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold tracking-tight text-lg text-[#F4EEE7] group-hover:text-[#D8B88C] transition-colors">
                VIBE <span className="text-[#C9A6B8]">MATCH</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono-accent tracking-wider uppercase rounded bg-[#2A2630] text-[#B8A7C9] border border-[#B8A7C9]/20">
                CURATED
              </span>
            </div>
            <span className="text-[10.5px] text-[#B9AFB7] -mt-0.5 tracking-wide">
              Photo → Feeling → Song
            </span>
          </div>
        </button>

        {/* Live Tone Synthesizer Monitor */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              id="btn-audio-header-toggle"
              onClick={() => audioPlayer.stop()}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2A2630] border border-[#D8B88C]/40 text-[#D8B88C] text-xs font-medium hover:bg-[#211E25] transition-colors"
              title="Stop audio preview"
            >
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-full bg-[#D8B88C] animate-[bounce_0.8s_infinite]" />
                <span className="w-0.5 h-2/3 bg-[#D8B88C] animate-[bounce_0.6s_infinite]" />
                <span className="w-0.5 h-4/5 bg-[#D8B88C] animate-[bounce_0.9s_infinite]" />
              </span>
              <span className="text-[10px] font-mono-accent">PREVIEWING</span>
              <Volume2 className="w-3.5 h-3.5 text-[#D8B88C]" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#8E7A86]">
              <AudioWaveform className="w-3.5 h-3.5 text-[#B8A7C9]" />
              <span className="hidden sm:inline font-mono-accent text-[10px] tracking-wide">AUDIO ENGINE</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

