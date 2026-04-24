import GObject from 'gi://GObject?version=2.0';
import AstalMpris from 'gi://AstalMpris?version=0.1';

import {
  register,
  property,
} from 'ags/gobject';

import tosu from './tosu';

export type NowPlayingSource = 'none' | 'tosu' | 'mpris';

@register()
export class NowPlayingService extends GObject.Object {
  @property(Boolean) available: boolean = false;
  @property(String) title: string = '';
  @property(String) artist: string = '';
  @property(String) artwork: string = '';
  @property(Number) stars: number = 0;
  @property(String) source: NowPlayingSource = 'none';

  private mpris: AstalMpris.Mpris;
  private bound = new WeakSet<AstalMpris.Player>();

  constructor() {
    super();
    this.mpris = AstalMpris.get_default();

    for (const p of ['available', 'title', 'artist', 'background', 'stars']) {
      tosu.connect(`notify::${p}`, () => this.recompute());
    }

    this.mpris.connect('notify::players', () => {
      this.mpris.players.forEach((p) => this.bindPlayer(p));
      this.recompute();
    });
    this.mpris.connect('player-added', (_, player: AstalMpris.Player) => {
      this.bindPlayer(player);
      this.recompute();
    });
    this.mpris.connect('player-closed', () => this.recompute());

    this.mpris.players.forEach((p) => this.bindPlayer(p));
    this.recompute();
  }

  private bindPlayer(player: AstalMpris.Player) {
    if (this.bound.has(player)) return;
    this.bound.add(player);
    for (const p of ['playback-status', 'title', 'artist', 'cover-art', 'art-url']) {
      player.connect(`notify::${p}`, () => this.recompute());
    }
  }

  private pickMprisPlayer(): AstalMpris.Player | null {
    const players = this.mpris.players;
    return players.find((p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING && p.title)
      ?? players.find((p) => p.playbackStatus === AstalMpris.PlaybackStatus.PAUSED && p.title)
      ?? null;
  }

  private recompute() {
    let source: NowPlayingSource = 'none';
    let title = '';
    let artist = '';
    let artwork = '';
    let stars = 0;

    if (tosu.available) {
      source = 'tosu';
      title = tosu.title;
      artist = tosu.artist;
      artwork = tosu.background;
      stars = tosu.stars;
    } else {
      const player = this.pickMprisPlayer();
      if (player) {
        source = 'mpris';
        title = player.title;
        artist = player.artist;
        artwork = player.coverArt || player.artUrl || '';
      }
    }

    const available = !!title;
    const wasAvailable = this.available;

    this.freeze_notify();
    try {
      if (wasAvailable && !available) this.available = false;
      if (this.title !== title) this.title = title;
      if (this.artist !== artist) this.artist = artist;
      if (this.artwork !== artwork) this.artwork = artwork;
      if (this.stars !== stars) this.stars = stars;
      if (this.source !== source) this.source = source;
      if (!wasAvailable && available) this.available = true;
    } finally {
      this.thaw_notify();
    }
  }
}

export default new NowPlayingService();
