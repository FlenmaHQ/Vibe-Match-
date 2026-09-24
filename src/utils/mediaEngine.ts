/**
 * Share-Ready Media Engine
 * 
 * Formats images and videos for social destinations without cropping the subject:
 * - Instagram Story: 9:16 (1080x1920)
 * - Instagram Reel: 9:16 vertical video with legitimate licensed audio preview embedded when available
 * - Instagram Post: 4:5 portrait (1080x1350) or native aspect ratio
 * - WhatsApp Status: 9:16 (1080x1920) vertical media
 */

import { Song } from '../types';

export interface PreparedMedia {
  file: File;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: string;
  hasEmbeddedAudio?: boolean;
  explanationNote: string;
}

/**
 * Loads an image from a URL or Data URI safely into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      // Retry once without crossOrigin in case local blob/dataURI fails
      const retryImg = new Image();
      retryImg.onload = () => resolve(retryImg);
      retryImg.onerror = () => reject(new Error('Failed to load image for media preparation'));
      retryImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Renders a photo onto a target canvas preserving 100% of the subject:
 * - Ambient blurred background fills empty letterbox/pillarbox space
 * - Centered foreground image retains full resolution and uncropped subject
 */
function drawPhotoPreservingSubject(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
) {
  const targetRatio = targetWidth / targetHeight;
  const imgRatio = img.naturalWidth / img.naturalHeight;

  // Clear canvas
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  // If aspect ratios match closely (within 3%), draw full bleed
  if (Math.abs(targetRatio - imgRatio) < 0.04) {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return;
  }

  // 1. Draw blurred ambient background (cover)
  ctx.save();
  const scaleCover = Math.max(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
  const coverW = img.naturalWidth * scaleCover * 1.1;
  const coverH = img.naturalHeight * scaleCover * 1.1;
  const coverX = (targetWidth - coverW) / 2;
  const coverY = (targetHeight - coverH) / 2;

  // Apply heavy aesthetic blur & dimming
  ctx.filter = 'blur(45px) brightness(0.6)';
  ctx.drawImage(img, coverX, coverY, coverW, coverH);
  ctx.restore();

  // Subtle dark gradient overlay for depth
  const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. Draw centered foreground photo (contain) - NO CROPPING
  const scaleContain = Math.min(
    (targetWidth * 0.94) / img.naturalWidth,
    (targetHeight * 0.88) / img.naturalHeight
  );
  const fgW = Math.round(img.naturalWidth * scaleContain);
  const fgH = Math.round(img.naturalHeight * scaleContain);
  const fgX = Math.round((targetWidth - fgW) / 2);
  const fgY = Math.round((targetHeight - fgH) / 2);

  // Soft natural shadow behind foreground photo
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;

  // Rounded clipping mask for foreground photo
  const radius = 24;
  ctx.beginPath();
  ctx.roundRect(fgX, fgY, fgW, fgH, radius);
  ctx.clip();
  ctx.drawImage(img, fgX, fgY, fgW, fgH);
  ctx.restore();

  // Crisp delicate border around photo
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(fgX, fgY, fgW, fgH, radius);
  ctx.stroke();
  ctx.restore();
}

/**
 * Renders an aesthetic floating music sticker card onto canvas
 * so the shared media visibly carries the soundtrack title & artist
 */
export function drawMusicStickerOnCanvas(
  ctx: CanvasRenderingContext2D,
  song: Song,
  canvasWidth: number,
  canvasHeight: number,
  isVertical: boolean = true,
  artworkImg?: HTMLImageElement | null,
  eqFrameTime: number = 0
) {
  const cardW = Math.min(canvasWidth - 80, isVertical ? 940 : 860);
  const cardH = 156;
  const cardX = Math.round((canvasWidth - cardW) / 2);
  const cardY = Math.round(isVertical ? canvasHeight - 330 : canvasHeight - 200);

  ctx.save();
  // Pill shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;

  // Background pill (Deep frosted glass aesthetic)
  const radius = 34;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = 'rgba(18, 16, 22, 0.94)';
  ctx.fill();

  // Subtle metallic border
  ctx.strokeStyle = 'rgba(216, 184, 140, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Draw album art / vinyl badge on the left
  const badgeSize = 100;
  const badgeX = cardX + 28;
  const badgeY = cardY + (cardH - badgeSize) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 22);
  ctx.clip();

  if (artworkImg) {
    try {
      ctx.drawImage(artworkImg, badgeX, badgeY, badgeSize, badgeSize);
    } catch {
      ctx.fillStyle = '#2A2630';
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#2A2630';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201, 166, 184, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw musical notes / icon placeholder inside badge
    ctx.fillStyle = '#D8B88C';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎵', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
  }
  ctx.restore();

  // Draw Song Title & Artist text
  ctx.save();
  ctx.textAlign = 'left';
  const textX = badgeX + badgeSize + 26;
  const maxTextW = cardW - (badgeSize + 180);

  // Title with music note
  ctx.fillStyle = '#F4EEE7';
  ctx.font = 'bold 34px sans-serif';
  let title = song.title;
  if (ctx.measureText(title).width > maxTextW) {
    while (title.length > 3 && ctx.measureText(title + '…').width > maxTextW) {
      title = title.slice(0, -1);
    }
    title += '…';
  }
  ctx.fillText(title, textX, cardY + 54);

  // Artist + Mood
  ctx.fillStyle = '#D8B88C';
  ctx.font = '600 24px sans-serif';
  const subtitle = `${song.artist} • ${song.mood} Vibe`;
  let sub = subtitle;
  if (ctx.measureText(sub).width > maxTextW) {
    while (sub.length > 3 && ctx.measureText(sub + '…').width > maxTextW) {
      sub = sub.slice(0, -1);
    }
    sub += '…';
  }
  ctx.fillText(sub, textX, cardY + 95);

  // VibeMatch Tagline
  ctx.fillStyle = '#8E7A86';
  ctx.font = '500 18px sans-serif';
  ctx.fillText(`VibeMatch • ${song.language || 'Global'} Sound`, textX, cardY + 128);
  ctx.restore();

  // Draw animated live equalizer bars on the right
  ctx.save();
  const eqX = cardX + cardW - 75;
  const eqY = cardY + 54;
  const maxBarH = 48;
  const minBarH = 14;

  // Compute live animated heights using continuous trigonometric frequencies
  const t = eqFrameTime > 0 ? eqFrameTime : (Date.now() / 1000);
  const barFrequencies = [5.2, 7.8, 4.3, 6.9, 8.4];
  const barOffsets = [0.2, 1.4, 2.7, 0.9, 1.8];
  const barHeights = barFrequencies.map((freq, i) => {
    const wave = (Math.sin(t * freq + barOffsets[i]) + 1) / 2; // 0 to 1
    return Math.round(minBarH + wave * (maxBarH - minBarH));
  });

  barHeights.forEach((h, i) => {
    ctx.fillStyle = '#D8B88C';
    ctx.beginPath();
    ctx.roundRect(eqX + i * 9, eqY + (maxBarH - h) / 2, 4, h, 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Prepare 9:16 Instagram Story Image (1080 x 1920)
 */
export async function prepareStoryMedia(photoUrl: string, song?: Song): Promise<PreparedMedia> {
  const img = await loadImage(photoUrl);

  let artworkImg: HTMLImageElement | null = null;
  if (song?.artworkUrl) {
    try {
      artworkImg = await loadImage(song.artworkUrl);
    } catch {
      // fallback fine if network restricts crossOrigin
    }
  }

  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  drawPhotoPreservingSubject(ctx, img, width, height);

  // Overlay the aesthetic music badge directly on the story photo
  if (song) {
    drawMusicStickerOnCanvas(ctx, song, width, height, true, artworkImg);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create Story image blob'))),
      'image/jpeg',
      0.95
    );
  });

  const file = new File([blob], 'vibe-match-story.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
  return {
    file,
    mimeType: 'image/jpeg',
    width,
    height,
    aspectRatio: '9:16',
    explanationNote: song
      ? `Story photo ready in 9:16 with "${song.title}" music badge embedded.`
      : 'Story photo prepared in 9:16 vertical format.',
  };
}

/**
 * Prepare Instagram Post Image (4:5 portrait 1080 x 1350 or square)
 */
export async function preparePostMedia(photoUrl: string, song?: Song): Promise<PreparedMedia> {
  const img = await loadImage(photoUrl);
  const canvas = document.createElement('canvas');

  const imgRatio = img.naturalWidth / img.naturalHeight;
  let width = 1080;
  let height = 1350; // Standard 4:5 portrait

  // If image is already a clean square (within 5%), use 1080x1080
  if (Math.abs(imgRatio - 1) < 0.05) {
    height = 1080;
  } else if (imgRatio > 1.2) {
    // Landscape photo: standard feed landscape 1080x608 or 1080x1080 boxed
    height = 1080;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  drawPhotoPreservingSubject(ctx, img, width, height);

  // Overlay the aesthetic floating music sticker card onto the post photo
  // so the soundtrack title, artist, and vibe match are visibly embedded!
  if (song) {
    const isVertical = height > width;
    drawMusicStickerOnCanvas(ctx, song, width, height, isVertical);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create Post image blob'))),
      'image/jpeg',
      0.95
    );
  });

  const file = new File([blob], 'vibe-match-post.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
  return {
    file,
    mimeType: 'image/jpeg',
    width,
    height,
    aspectRatio: `${width}:${height}`,
    explanationNote: song
      ? `Post image prepared. Full caption & hashtags copied — paste when composing on Instagram.`
      : 'Post image prepared in high quality.',
  };
}

/**
 * Prepare 9:16 WhatsApp Status Media (1080 x 1920)
 */
export async function prepareWhatsAppStatusMedia(photoUrl: string, song?: Song): Promise<PreparedMedia> {
  const img = await loadImage(photoUrl);
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  drawPhotoPreservingSubject(ctx, img, width, height);

  // Overlay the aesthetic music badge directly on the status photo
  if (song) {
    drawMusicStickerOnCanvas(ctx, song, width, height, true);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create Status image blob'))),
      'image/jpeg',
      0.95
    );
  });

  const file = new File([blob], 'vibe-match-whatsapp-status.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
  return {
    file,
    mimeType: 'image/jpeg',
    width,
    height,
    aspectRatio: '9:16',
    explanationNote: song
      ? `Status photo ready in 9:16 with "${song.title}" music badge embedded.`
      : 'Status photo prepared in 9:16 format.',
  };
}

/**
 * Helper to fetch remote audio preview safely via direct or proxy
 */
async function fetchAudioBuffer(audioUrl: string, audioCtx: AudioContext): Promise<AudioBuffer | null> {
  try {
    let resp: Response;
    try {
      resp = await fetch(audioUrl, { mode: 'cors' });
      if (!resp.ok) throw new Error('Direct fetch failed');
    } catch {
      // Fallback through audio-proxy
      const proxyUrl = `/api/music/audio-proxy?url=${encodeURIComponent(audioUrl)}`;
      resp = await fetch(proxyUrl);
    }
    if (!resp.ok) return null;
    const arrayBuffer = await resp.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.warn('Could not decode audio preview for video embedding:', err);
    return null;
  }
}

/**
 * Prepare 9:16 Instagram Reel Vertical Video with embedded legitimate audio preview
 */
export async function prepareReelMedia(
  photoUrl: string,
  song?: Song,
  onProgress?: (step: string) => void
): Promise<PreparedMedia> {
  const img = await loadImage(photoUrl);
  const width = 720; // 720x1280 (HD 9:16) for fast in-browser rendering
  const height = 1280;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Check if MediaRecorder is supported
  const isMediaRecorderSupported = typeof window !== 'undefined' && typeof window.MediaRecorder === 'function';

  if (!isMediaRecorderSupported) {
    // Graceful fallback to 9:16 Reel vertical photo
    onProgress?.('Browser does not support video encoding, preparing high-res 9:16 Reel graphic...');
    return prepareStoryMedia(photoUrl, song);
  }

  onProgress?.('Preparing 9:16 Reel video...');

  // Set up AudioContext if song preview exists
  let audioBuffer: AudioBuffer | null = null;
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  if (song?.previewUrl) {
    onProgress?.('Checking licensed audio preview...');
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        audioBuffer = await fetchAudioBuffer(song.previewUrl, audioCtx);
      }
    } catch (e) {
      console.warn('AudioContext setup skipped:', e);
    }
  }

  // Determine supported mimeType
  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  // Video stream from canvas
  const canvasStream = canvas.captureStream(30); // 30 FPS
  let combinedStream: MediaStream = canvasStream;

  let audioSource: AudioBufferSourceNode | null = null;
  if (audioCtx && audioBuffer) {
    audioDest = audioCtx.createMediaStreamDestination();
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioDest);
    audioSource.connect(audioCtx.destination); // optional monitor

    // Combine video tracks + audio tracks
    const audioTrack = audioDest.stream.getAudioTracks()[0];
    if (audioTrack) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        audioTrack,
      ]);
    }
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 2500000, // 2.5 Mbps crisp mobile video
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  // Optimize performance: Pre-render static blurred ambient background canvas ONCE
  // Running ctx.filter = 'blur(40px)' on every single frame causes extreme CPU/GPU stalling ("hanging")!
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = width;
  bgCanvas.height = height;
  const bgCtx = bgCanvas.getContext('2d');
  if (bgCtx) {
    const scaleCover = Math.max(width / img.naturalWidth, height / img.naturalHeight) * 1.05;
    const coverW = img.naturalWidth * scaleCover;
    const coverH = img.naturalHeight * scaleCover;
    const coverX = (width - coverW) / 2;
    const coverY = (height - coverH) / 2;
    bgCtx.filter = 'blur(35px) brightness(0.6)';
    bgCtx.drawImage(img, coverX, coverY, coverW, coverH);

    // Vignette / depth overlay
    const grad = bgCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, width, height);
  }

  // Pre-load song artwork if available for sticker
  let artworkImg: HTMLImageElement | null = null;
  if (song?.artworkUrl) {
    try {
      artworkImg = await loadImage(song.artworkUrl);
    } catch {
      // artwork fallback fine
    }
  }

  const durationSeconds = 15; // 15-second song duration as requested
  const fps = 30;
  const totalFrames = durationSeconds * fps;

  return new Promise<PreparedMedia>((resolve, reject) => {
    recorder.onstop = () => {
      if (audioSource) {
        try { audioSource.stop(); } catch {}
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch {}
      }

      const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
      const videoBlob = new Blob(chunks, { type: selectedMime });
      const file = new File([videoBlob], `vibe-match-reel.${ext}`, {
        type: selectedMime,
        lastModified: Date.now(),
      });

      const hasAudio = Boolean(audioBuffer);
      const explanationNote = hasAudio
        ? `9:16 Reel vertical video created with 15s audio preview embedded. Ready to publish on Instagram Reels!`
        : song
        ? `9:16 Reel vertical video created (15s). Audio not embedded — use Instagram Reel's music picker to select "${song.title}".`
        : '9:16 Reel vertical video prepared.';

      resolve({
        file,
        mimeType: selectedMime,
        width,
        height,
        aspectRatio: '9:16',
        hasEmbeddedAudio: hasAudio,
        explanationNote,
      });
    };

    recorder.onerror = (err) => {
      reject(new Error(`Video recording error: ${err}`));
    };

    // Start recording
    recorder.start();
    if (audioSource && audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (audioSource) {
      audioSource.start(0);
    }

    let frame = 0;

    function renderFrame() {
      const progress = frame / totalFrames;
      const currentTimeSec = frame / fps;

      // Clear canvas
      ctx!.clearRect(0, 0, width, height);

      // Fast blit of pre-rendered background (Smooth & zero hanging)
      ctx!.drawImage(bgCanvas, 0, 0, width, height);

      // Foreground centered (preserves subject)
      const scaleContain = Math.min(
        (width * 0.94) / img.naturalWidth,
        (height * 0.88) / img.naturalHeight
      );
      const fgW = Math.round(img.naturalWidth * scaleContain);
      const fgH = Math.round(img.naturalHeight * scaleContain);
      const fgX = Math.round((width - fgW) / 2);
      const fgY = Math.round((height - fgH) / 2);

      ctx!.save();
      ctx!.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx!.shadowBlur = 24;
      ctx!.shadowOffsetY = 8;
      const radius = 24;
      ctx!.beginPath();
      ctx!.roundRect(fgX, fgY, fgW, fgH, radius);
      ctx!.clip();
      ctx!.drawImage(img, fgX, fgY, fgW, fgH);
      ctx!.restore();

      // Overlay floating music badge with LIVE ANIMATED equalizer lines
      if (song) {
        drawMusicStickerOnCanvas(ctx!, song, width, height, true, artworkImg, currentTimeSec);
      }

      frame++;
      if (frame < totalFrames) {
        requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    }

    requestAnimationFrame(renderFrame);
  });
}
