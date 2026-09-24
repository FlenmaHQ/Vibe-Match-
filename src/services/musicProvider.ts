// Music Provider Adapter Architecture

export interface MusicTrackMetadata {
  id: string;
  title: string;
  artist: string;
  album?: string;
  previewUrl: string | null;
  artworkUrl: string | null;
  listenUrl: string;
  genre?: string;
  durationMs?: number;
  releaseDate?: string;
}

export interface IMusicProvider {
  name: string;
  search(query: string, options?: { limit?: number; language?: string }): Promise<MusicTrackMetadata[]>;
  getTrack(trackId: string): Promise<MusicTrackMetadata | null>;
  getPreview(title: string, artist: string): Promise<string | null>;
  getArtwork(title: string, artist: string): Promise<string | null>;
}

export class ITunesMusicProvider implements IMusicProvider {
  public name = 'Apple iTunes Search API';

  private cache = new Map<string, MusicTrackMetadata | null>();

  public async search(query: string, options: { limit?: number; language?: string } = {}): Promise<MusicTrackMetadata[]> {
    try {
      const limit = options.limit || 10;
      const term = encodeURIComponent(query.trim());
      const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=${limit}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((r: any) => ({
        id: String(r.trackId),
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName,
        previewUrl: r.previewUrl || null,
        artworkUrl: r.artworkUrl100?.replace('100x100bb', '300x300bb') || r.artworkUrl100 || null,
        listenUrl: r.trackViewUrl || `https://open.spotify.com/search/${encodeURIComponent(`${r.trackName} ${r.artistName}`)}`,
        genre: r.primaryGenreName,
        durationMs: r.trackTimeMillis,
        releaseDate: r.releaseDate,
      }));
    } catch (err) {
      console.warn('[ITunesMusicProvider] search error:', err);
      return [];
    }
  }

  public async getTrack(trackId: string): Promise<MusicTrackMetadata | null> {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(trackId)}&entity=song`);
      if (!res.ok) return null;
      const data = await res.json();
      const r = data.results?.[0];
      if (!r) return null;
      return {
        id: String(r.trackId),
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName,
        previewUrl: r.previewUrl || null,
        artworkUrl: r.artworkUrl100?.replace('100x100bb', '300x300bb') || r.artworkUrl100 || null,
        listenUrl: r.trackViewUrl || `https://open.spotify.com/search/${encodeURIComponent(`${r.trackName} ${r.artistName}`)}`,
        genre: r.primaryGenreName,
        durationMs: r.trackTimeMillis,
        releaseDate: r.releaseDate,
      };
    } catch {
      return null;
    }
  }

  public async getPreview(title: string, artist: string): Promise<string | null> {
    const key = `${title.toLowerCase()}:::${artist.toLowerCase()}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)?.previewUrl || null;
    }

    const results = await this.search(`${artist} ${title}`, { limit: 1 });
    if (results.length > 0) {
      this.cache.set(key, results[0]);
      return results[0].previewUrl;
    }
    this.cache.set(key, null);
    return null;
  }

  public async getArtwork(title: string, artist: string): Promise<string | null> {
    const key = `${title.toLowerCase()}:::${artist.toLowerCase()}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)?.artworkUrl || null;
    }

    const results = await this.search(`${artist} ${title}`, { limit: 1 });
    if (results.length > 0) {
      this.cache.set(key, results[0]);
      return results[0].artworkUrl;
    }
    this.cache.set(key, null);
    return null;
  }
}

export const musicProvider = new ITunesMusicProvider();
