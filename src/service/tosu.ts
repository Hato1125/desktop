import GObject from 'gi://GObject?version=2.0';
import GLib from 'gi://GLib?version=2.0';

import {
  register,
  property,
} from 'ags/gobject';

import fetch from 'gnim/fetch';

const INTERVAL = 2000;
const URL = 'http://127.0.0.1:24050/json/v2';
const LAZER_FILES = `${GLib.get_home_dir()}/.local/share/osu/files`;

const resolvePath = (p: string) => {
  if (!p) return '';
  if (p.startsWith('/')) return p;
  return `${LAZER_FILES}/${p}`;
};

@register()
export class TosuService extends GObject.Object {
  @property(Boolean) available: boolean = false;
  @property(String) title: string = '';
  @property(String) artist: string = '';
  @property(String) background: string = '';
  @property(Number) stars: number = 0;

  constructor() {
    super();
    this.fetch();
    setInterval(() => this.fetch(), INTERVAL);
  }

  private async fetch() {
    try {
      const res = await fetch(URL);
      const data = await res.json();
      const bm = data?.beatmap;
      const title = bm?.titleUnicode || bm?.title || '';
      const artist = bm?.artistUnicode || bm?.artist || '';
      const background = resolvePath(data?.directPath?.beatmapBackground || '');
      const stars = bm?.stats?.stars?.total ?? 0;

      if (this.title !== title) this.title = title;
      if (this.artist !== artist) this.artist = artist;
      if (this.background !== background) this.background = background;
      if (this.stars !== stars) this.stars = stars;
      const available = !!title;
      if (this.available !== available) this.available = available;
    } catch {
      if (this.available) this.available = false;
    }
  }
}

export default new TosuService();
