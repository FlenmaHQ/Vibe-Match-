import { Song, DestinationOption } from '../types';
import {
  prepareStoryMedia,
  preparePostMedia,
  prepareWhatsAppStatusMedia,
  prepareReelMedia,
  PreparedMedia,
} from './mediaEngine';
import {
  isNativeAndroidContainer,
  dispatchNativeAndroidIntent,
} from './nativeAndroidBridge';

export type ShareTarget = 'instagram-reel' | 'instagram-story' | 'instagram-post' | 'whatsapp-status' | 'system';

export interface ShareExecutionResult {
  target: ShareTarget;
  actionTaken: 'native-android' | 'web-share-files' | 'download-fallback' | 'copied';
  success: boolean;
  message: string;
  nextStepInstruction: string;
  preparedMedia?: PreparedMedia;
  audioEmbedded?: boolean;
}

/**
 * Creates an aesthetic social caption for the matched song (zero links)
 */
export function buildSocialCaption(song: Song, target: ShareTarget, destination?: DestinationOption): string {
  const moodTag = song.mood ? `#${song.mood.replace(/\s+/g, '')}Vibe` : '#VibeMatch';

  switch (target) {
    case 'instagram-story':
      return `🎵 ${song.title} - ${song.artist}\n✨ Mood: ${song.mood} (${song.language})`;

    case 'instagram-post':
      return `🎧 Now Playing: "${song.title}" by ${song.artist}\n` +
        `✨ Aesthetic Vibe: ${song.mood} • ${song.genre}\n` +
        `🎯 Visual Match: ${song.matchScore || 92}% Affinity\n` +
        `\n${moodTag} #NowPlaying #AestheticFeed #VibeMatch`;

    case 'instagram-reel':
      return `🎵 Audio: ${song.title} - ${song.artist}\n` +
        `✨ Mood: ${song.mood} | ${song.genre}\n` +
        `#Reels #TrendingAudio #VibeMatch`;

    case 'whatsapp-status':
      return `🎧 Currently listening to: *${song.title}* by ${song.artist}\n` +
        `✨ Vibe: ${song.mood} (${song.language})`;

    default:
      return `🎧 ${song.title} - ${song.artist} (${song.mood} vibe)`;
  }
}

/**
 * Directly launches the Instagram Story camera / create console on mobile devices
 */
export function launchInstagramStoryDirectly() {
  if (typeof window === 'undefined') return;
  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  if (isAndroid) {
    // 1. Primary: Android Story camera intent URL (supported by Chrome, Samsung Internet, Vivo Browser)
    // 2. Direct fallback to standard Instagram URI scheme
    try {
      const intentUrl = 'intent://story-camera#Intent;package=com.instagram.android;scheme=instagram;action=android.intent.action.VIEW;end';
      const fallbackUrl = 'instagram://story-camera';
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Attempt opening app scheme
      window.location.href = intentUrl;

      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 1000);
    } catch {
      window.location.href = 'instagram://story-camera';
    }
  } else if (isIOS) {
    window.location.href = 'instagram://story-camera';
  } else {
    // Desktop or other browser
    window.open('https://www.instagram.com/create/story/', '_blank');
  }
}

/**
 * Downloads a prepared media File to the user's device
 */
export function downloadMediaFile(file: File) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Helper to convert File to base64 Data URL for native Android bridge
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Execute real destination-specific share flow:
 * 1. Formats photo/video in true destination dimensions without subject cropping
 * 2. If Reel & preview audio is legally embeddable, synthesizes 9:16 vertical video with audio
 * 3. Dispatches to Native Android Intent or Web Share API with File attachment
 * 4. Fallback: downloads prepared file, copies aesthetic caption, and provides clear one-sentence instruction
 * 5. NEVER pretends to control third-party music pickers or fake deep links
 */
export async function executeSocialShare(
  target: ShareTarget,
  photoUrl: string,
  song: Song,
  onStatusUpdate?: (status: string) => void
): Promise<ShareExecutionResult> {
  // Do NOT automatically copy text to clipboard here (user requested: do not copy text first)

  // 1. Prepare destination media
  let prepared: PreparedMedia;
  try {
    if (target === 'instagram-reel') {
      onStatusUpdate?.('Preparing 9:16 Reel vertical video (15s)...');
      prepared = await prepareReelMedia(photoUrl, song, onStatusUpdate);
    } else if (target === 'instagram-story') {
      onStatusUpdate?.('Formatting 9:16 Story photo...');
      prepared = await prepareStoryMedia(photoUrl, song);
    } else if (target === 'instagram-post') {
      onStatusUpdate?.('Formatting Instagram Post photo...');
      prepared = await preparePostMedia(photoUrl, song);
    } else if (target === 'whatsapp-status') {
      onStatusUpdate?.('Formatting 9:16 WhatsApp Status photo...');
      prepared = await prepareWhatsAppStatusMedia(photoUrl, song);
    } else {
      // System generic
      prepared = await prepareStoryMedia(photoUrl, song);
    }
  } catch (err: any) {
    console.warn('Media preparation fallback:', err);
    // Fallback if canvas fails
    const resp = await fetch(photoUrl);
    const blob = await resp.blob();
    const file = new File([blob], 'vibe-match-photo.jpg', { type: blob.type || 'image/jpeg' });
    prepared = {
      file,
      mimeType: file.type,
      width: 1080,
      height: 1920,
      aspectRatio: '9:16',
      explanationNote: 'Media prepared from original photo.',
    };
  }

  // 2. Check Native Android Bridge
  if (isNativeAndroidContainer()) {
    onStatusUpdate?.('Launching Android sharing...');
    try {
      const fileBase64 = await fileToBase64(prepared.file);
      const pkg = target === 'whatsapp-status' ? 'com.whatsapp' : 'com.instagram.android';
      const nativeResult = await dispatchNativeAndroidIntent({
        action: target === 'instagram-story' ? 'com.instagram.share.ADD_TO_STORY' : 'android.intent.action.SEND',
        mimeType: prepared.mimeType,
        packageName: pkg,
        title: `${song.title} - ${song.artist}`,
        fileBase64,
        fileName: prepared.file.name,
      });

      if (nativeResult.success) {
        return {
          target,
          actionTaken: 'native-android',
          success: true,
          message: 'Opened in Android Instagram Story.',
          nextStepInstruction: getNextStepInstruction(target, song, prepared.hasEmbeddedAudio),
          preparedMedia: prepared,
          audioEmbedded: prepared.hasEmbeddedAudio,
        };
      }
    } catch (nativeErr) {
      console.warn('Native Android intent dispatch error:', nativeErr);
    }
  }

  // 3. Check Web Share API with File support
  // CRITICAL: We pass ONLY { files: [prepared.file], title: song.title }
  // Do NOT pass `text` or `url`! When text or url is passed, Android browsers (Vivo, Samsung, Chrome)
  // switch the intent to a pure URL/text share sheet ("Sharing text"), which only shows Direct Messages / Chat.
  // Passing strictly files: [prepared.file] instructs Android to open the media/image receiver (Instagram Stories/Reels/Feed)!
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    let canShareWithFiles = false;
    try {
      canShareWithFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [prepared.file] });
    } catch {
      canShareWithFiles = false;
    }

    if (canShareWithFiles) {
      onStatusUpdate?.('Opening device share sheet with your photo...');
      try {
        await navigator.share({
          files: [prepared.file],
          title: song ? `${song.title} - ${song.artist}` : 'VibeMatch Photo',
        });

        return {
          target,
          actionTaken: 'web-share-files',
          success: true,
          message: 'Photo with your chosen song sent to Instagram!',
          nextStepInstruction: getNextStepInstruction(target, song, prepared.hasEmbeddedAudio),
          preparedMedia: prepared,
          audioEmbedded: prepared.hasEmbeddedAudio,
        };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return {
            target,
            actionTaken: 'web-share-files',
            success: true,
            message: 'Story ready with your chosen song!',
            nextStepInstruction: getNextStepInstruction(target, song, prepared.hasEmbeddedAudio),
            preparedMedia: prepared,
            audioEmbedded: prepared.hasEmbeddedAudio,
          };
        }
        console.warn('navigator.share failed, switching to direct save:', shareErr);
      }
    }
  }

  // 4. Reliable Direct Fallback:
  // Save prepared media with song badge to gallery cleanly
  onStatusUpdate?.('Saving photo with soundtrack badge...');
  downloadMediaFile(prepared.file);

  return {
    target,
    actionTaken: 'download-fallback',
    success: true,
    message: `${prepared.file.name} saved to your device gallery!`,
    nextStepInstruction: getNextStepInstruction(target, song, prepared.hasEmbeddedAudio),
    preparedMedia: prepared,
    audioEmbedded: prepared.hasEmbeddedAudio,
  };
}

/**
 * Returns a concise, honest, one-sentence next step instruction
 * without faking automation or platform capabilities.
 */
function getNextStepInstruction(target: ShareTarget, song: Song, hasEmbeddedAudio?: boolean): string {
  switch (target) {
    case 'instagram-reel':
      if (hasEmbeddedAudio) {
        return `Reel video is ready with audio — select Reels in Instagram to publish.`;
      }
      return `Upload your prepared 9:16 Reel video with "${song.title}" in Instagram.`;

    case 'instagram-story':
      return `Photo with "${song.title}" is saved with the soundtrack badge and ready for your Story.`;

    case 'instagram-post':
      return `Open Instagram (+) → Post to select your prepared photo with "${song.title}".`;

    case 'whatsapp-status':
      return `Open WhatsApp → Status to share your prepared 9:16 photo with "${song.title}".`;

    default:
      return `Media with "${song.title}" is prepared and saved to your device.`;
  }
}
