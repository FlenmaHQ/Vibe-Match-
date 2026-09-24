import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, RefreshCw, Camera } from 'lucide-react';
import { SAMPLE_PHOTOS, SamplePhoto } from '../data/samplePhotos';

interface PhotoUploaderProps {
  selectedImage: string | null;
  onImageSelected: (imageSrc: string) => void;
  onClearImage: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  selectedImage,
  onImageSelected,
  onClearImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onImageSelected(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Eyebrow & Hero Copy */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#211E25] border border-[#2A2630] text-[#D8B88C] text-xs font-mono-accent tracking-widest uppercase shadow-sm">
          <Sparkles className="w-3 h-3 text-[#C9A6B8]" />
          <span>PHOTO → FEELING → SONG</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4EEE7]">
          Your photo has a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D8B88C] via-[#C9A6B8] to-[#B8A7C9]">vibe.</span>
        </h1>

        <p className="text-[#B9AFB7] text-base sm:text-lg font-normal">
          We’ll find the music.
        </p>
      </div>

      {/* Upload Zone or Photo Preview */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {selectedImage ? (
          <div className="relative rounded-2xl overflow-hidden brand-glow-card border border-[#C9A6B8]/30 group">
            {/* The Photo Preview */}
            <div className="relative aspect-[4/5] sm:aspect-[4/3] max-h-[420px] w-full bg-[#17151A] flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage}
                alt="Selected upload"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Ambient gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17151A]/85 via-transparent to-[#17151A]/40 pointer-events-none" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#17151A]/80 backdrop-blur-md border border-[#2A2630] text-xs text-[#F4EEE7] font-medium flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#D8B88C] animate-pulse" />
                <span>Visual Focus Ready</span>
              </div>

              {/* Action Buttons Top Right */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  id="btn-replace-photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-full bg-[#211E25]/80 backdrop-blur-md border border-[#2A2630] text-xs text-[#F4EEE7] hover:border-[#C9A6B8]/50 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-[#B8A7C9]" />
                  <span>Change</span>
                </button>

                <button
                  id="btn-remove-photo"
                  onClick={onClearImage}
                  className="p-1 rounded-full bg-[#211E25]/80 backdrop-blur-md border border-[#2A2630] text-[#B9AFB7] hover:text-[#F4EEE7] hover:border-[#C9A6B8]/50 transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Visual Hint */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#F4EEE7] px-3.5 py-2 rounded-xl bg-[#17151A]/80 backdrop-blur-md border border-[#2A2630] shadow-sm">
                <span className="flex items-center gap-1.5 text-[#D8B88C] font-mono-accent">
                  <Sparkles className="w-3 h-3 text-[#C9A6B8]" />
                  Vibe Analysis Ready
                </span>
                <span className="text-[#B9AFB7]">Mood, energy & lighting will be analyzed</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            id="dropzone-photo-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer relative rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragging
                ? 'border-[#D8B88C] bg-[#2A2630]/60 scale-[1.01]'
                : 'border-[#2A2630] hover:border-[#C9A6B8]/50 bg-[#211E25]/70 hover:bg-[#211E25]'
            }`}
          >
            {/* Center icon */}
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-[#2A2630] border border-[#B8A7C9]/20 flex items-center justify-center text-[#D8B88C] shadow-lg">
                <UploadCloud className="w-8 h-8 text-[#D8B88C] group-hover:scale-110 transition-transform" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#211E25] border border-[#C9A6B8]/40 flex items-center justify-center">
                <Camera className="w-3 h-3 text-[#C9A6B8]" />
              </span>
            </div>

            <p className="text-base font-semibold text-[#F4EEE7] mb-1">
              Drop your photo here, or <span className="text-[#D8B88C] underline underline-offset-4">browse device</span>
            </p>
            <p className="text-xs text-[#B9AFB7] max-w-xs">
              Supports JPEG, PNG, WebP or HEIC up to 25MB
            </p>
          </div>
        )}
      </div>

      {/* Instant Sample Photos Pill Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#B9AFB7]">
          <span className="flex items-center gap-1 font-mono-accent text-[11px] text-[#B9AFB7] uppercase tracking-wider">
            <ImageIcon className="w-3 h-3 text-[#B8A7C9]" />
            Curated Sample Aesthetics:
          </span>
          <span className="text-[10px] text-[#8E7A86]">Tap to load</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SAMPLE_PHOTOS.map((sample: SamplePhoto) => (
            <button
              key={sample.id}
              id={`btn-sample-${sample.id}`}
              type="button"
              onClick={() => onImageSelected(sample.url)}
              className="group relative rounded-xl overflow-hidden aspect-square border border-[#2A2630] hover:border-[#D8B88C] transition-all focus:outline-none focus:ring-1 focus:ring-[#D8B88C]"
            >
              <img
                src={sample.url}
                alt={sample.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17151A] via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />
              <div className="absolute bottom-1.5 left-1 right-1 text-[9.5px] font-medium text-[#F4EEE7] truncate text-center leading-tight">
                {sample.title.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
