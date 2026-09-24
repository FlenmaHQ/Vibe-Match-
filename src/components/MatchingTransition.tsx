import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, Disc3 } from 'lucide-react';
import { DetectedVibeData } from '../types';

interface MatchingTransitionProps {
  photoUrl: string;
  vibeData: DetectedVibeData | null;
  onComplete: () => void;
}

const STEPS = [
  {
    step: 1,
    title: 'Reading visual atmosphere…',
    subtitle: 'Extracting tonal temperature, luminance & composition',
    icon: Sparkles,
    color: 'text-[#D8B88C]',
  },
  {
    step: 2,
    title: 'Synthesizing vibe profile…',
    subtitle: 'Harmonizing mood, energy resonance & aesthetic lighting',
    icon: Compass,
    color: 'text-[#C9A6B8]',
  },
  {
    step: 3,
    title: 'Curating soundtrack…',
    subtitle: 'Selecting top 5 tracks tailored for your destination',
    icon: Disc3,
    color: 'text-[#B8A7C9]',
  },
];

export const MatchingTransition: React.FC<MatchingTransitionProps> = ({
  photoUrl,
  vibeData,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Step 1 -> Step 2 after 950ms
    const timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
    }, 950);

    // Step 2 -> Step 3 after 2000ms
    const timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
    }, 2000);

    // Completion after 3100ms
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const current = STEPS[currentStepIndex];
  const CurrentIcon = current.icon;

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 flex flex-col items-center justify-center text-center space-y-6">
      {/* Uploaded Photo with Active Scanner Radar */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden brand-glow-card border border-[#C9A6B8]/40 p-2 shadow-2xl">
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#17151A]">
          <img
            src={photoUrl}
            alt="Analyzing photo"
            className="w-full h-full object-cover"
          />

          {/* Glowing horizontal scanning line */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D8B88C] to-transparent shadow-[0_0_12px_#D8B88C]"
            animate={{
              top: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Subtle Vignette */}
          <div className="absolute inset-0 bg-[#17151A]/25 pointer-events-none" />
        </div>

        {/* Outer border glow */}
        <div className="absolute inset-0 pointer-events-none border border-[#D8B88C]/20 rounded-3xl animate-pulse" />
      </div>

      {/* Extracted Color Palette Pill Peek */}
      {vibeData && vibeData.palette.length > 0 && (
        <div className="flex items-center gap-1.5 p-1.5 px-3 rounded-full bg-[#211E25] border border-[#2A2630] backdrop-blur-md shadow-sm">
          {vibeData.palette.map((color, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="w-3.5 h-3.5 rounded-full border border-white/10 shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          <span className="text-[10px] text-[#B9AFB7] font-mono-accent pl-1.5">
            palette extracted
          </span>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isCurrent
                  ? 'w-8 bg-[#D8B88C] shadow-sm'
                  : isDone
                  ? 'w-4 bg-[#C9A6B8]'
                  : 'w-2 bg-[#2A2630]'
              }`}
            />
          );
        })}
      </div>

      {/* Current Step Animated Text */}
      <div className="min-h-[85px] flex flex-col items-center justify-center space-y-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-1">
              <CurrentIcon className={`w-5 h-5 ${current.color} animate-spin`} />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F4EEE7]">
                {current.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#B9AFB7] max-w-xs">
              {current.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <button
        id="btn-skip-matching-transition"
        onClick={onComplete}
        className="text-[11px] text-[#8E7A86] hover:text-[#F4EEE7] font-mono-accent underline underline-offset-4 transition-colors"
      >
        Skip animation →
      </button>
    </div>
  );
};
