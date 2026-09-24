/**
 * Native Android Bridge & Sharing Intent Interface
 * 
 * Supports:
 * - Native Android WebView JavascriptInterface (e.g. window.AndroidShare or window.Android)
 * - Capacitor / Cordova / React Native WebView bridge detections
 * - Standard Android ACTION_SEND Intent specifications with FileProvider content URIs
 * - Graceful fallback to Android Sharesheet and Web Share API
 */

export interface NativeSharePayload {
  action: 'android.intent.action.SEND' | 'com.instagram.share.ADD_TO_STORY';
  mimeType: string;
  packageName?: 'com.instagram.android' | 'com.whatsapp' | string;
  componentName?: string;
  title: string;
  text?: string;
  fileBase64?: string; // Data URL for FileProvider serialization
  fileName?: string;
  fileUri?: string; // content:// URI if pre-cached by native container
}

export interface NativeShareResult {
  handledByNative: boolean;
  success: boolean;
  packageTargeted?: string;
  error?: string;
  fallbackToSharesheet?: boolean;
}

/**
 * Checks if the app is currently running inside an Android native container
 * with a registered JavascriptInterface or hybrid bridge.
 */
export function isNativeAndroidContainer(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  return Boolean(
    win.AndroidShare ||
    win.Android ||
    win.Capacitor?.isNativePlatform?.() ||
    win.ReactNativeWebView
  );
}

/**
 * Dispatches a sharing action to native Android container via registered bridge.
 * Uses FileProvider content URI guidelines and package targeting.
 */
export async function dispatchNativeAndroidIntent(
  payload: NativeSharePayload
): Promise<NativeShareResult> {
  if (typeof window === 'undefined') {
    return { handledByNative: false, success: false, error: 'Window undefined' };
  }

  const win = window as any;

  // 1. Check custom Android JavascriptInterface (recommended pattern for Android WebView wrappers)
  if (win.AndroidShare && typeof win.AndroidShare.shareMedia === 'function') {
    try {
      const resultJson = win.AndroidShare.shareMedia(JSON.stringify(payload));
      const parsed = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
      return {
        handledByNative: true,
        success: parsed?.success ?? true,
        packageTargeted: payload.packageName,
      };
    } catch (err: any) {
      console.warn('AndroidShare bridge execution error:', err);
      // Try fallback to Android sharesheet
      if (typeof win.AndroidShare.openSharesheet === 'function') {
        try {
          win.AndroidShare.openSharesheet(JSON.stringify(payload));
          return { handledByNative: true, success: true, fallbackToSharesheet: true };
        } catch {}
      }
    }
  }

  // 2. Generic window.Android bridge
  if (win.Android && typeof win.Android.share === 'function') {
    try {
      win.Android.share(payload.fileBase64 || '', payload.mimeType, payload.packageName || '', payload.text || '');
      return { handledByNative: true, success: true, packageTargeted: payload.packageName };
    } catch (err: any) {
      console.warn('Android generic bridge error:', err);
    }
  }

  // 3. Capacitor Filesystem & Share plugin bridge
  if (win.Capacitor?.isNativePlatform?.() && win.Capacitor.Plugins?.Share) {
    try {
      await win.Capacitor.Plugins.Share.share({
        title: payload.title,
        text: payload.text,
        url: payload.fileUri,
        dialogTitle: 'Share soundtrack',
      });
      return { handledByNative: true, success: true };
    } catch (err: any) {
      console.warn('Capacitor share error:', err);
    }
  }

  // 4. React Native WebView postMessage bridge
  if (win.ReactNativeWebView && typeof win.ReactNativeWebView.postMessage === 'function') {
    try {
      win.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'VIBE_MATCH_NATIVE_SHARE',
        payload,
      }));
      return { handledByNative: true, success: true };
    } catch (err: any) {
      console.warn('ReactNative postMessage error:', err);
    }
  }

  return { handledByNative: false, success: false };
}
