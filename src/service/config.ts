import GObject from 'gi://GObject?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import Gio from 'gi://Gio?version=2.0';

import { readFile } from 'ags/file';
import {
  register,
  property,
} from 'ags/gobject';

type BarAnchor = 'top' | 'bottom';
type TransparentTheme = 'dark' | 'light' | 'auto';

const DEFAULT_BAR_START = ['menu', 'client'];
const DEFAULT_BAR_CENTER = ['workspaces'];
const DEFAULT_BAR_END = [
  'weather',
  'vpn',
  'network',
  'keylock',
  'devices',
  'battery',
  'datetime',
];

@register()
class BarConfig extends GObject.Object {
  @property(String) anchor: BarAnchor = 'top';
  @property(Boolean) transparent: boolean = false;
  @property(String) transparentTheme: TransparentTheme = 'auto';
  @property(Object) start: string[] = DEFAULT_BAR_START;
  @property(Object) center: string[] = DEFAULT_BAR_CENTER;
  @property(Object) end: string[] = DEFAULT_BAR_END;

  load(data: any) {
    this.anchor = data?.anchor ?? 'top';
    this.transparent = data?.transparent ?? false;
    this.transparentTheme = data?.transparent_theme ?? 'auto';
    this.start = data?.start ?? DEFAULT_BAR_START;
    this.center = data?.center ?? DEFAULT_BAR_CENTER;
    this.end = data?.end ?? DEFAULT_BAR_END;
  }
}

@register()
class DockConfig extends GObject.Object {
  @property(Boolean) enable: boolean = true;
  @property(Object) apps: string[] = [];

  load(data: any) {
    this.enable = data?.enable ?? true;
    this.apps = data?.apps ?? [];
  }
}

@register()
class ConfigService extends GObject.Object {
  @property(Object) bar = new BarConfig();
  @property(Object) dock = new DockConfig();

  private path = `${GLib.get_user_config_dir()}/desktop/config.json`;
  private monitor: Gio.FileMonitor | null = null;

  constructor() {
    super();
    this.load();
    this.watch();
  }

  private load() {
    try {
      const str = readFile(this.path);
      const json = JSON.parse(str);

      this.bar.load(json?.bar);
      this.dock.load(json?.dock);
    } catch (e) {
      console.error('Config: failed to load', e);
    }
  }

  private watch() {
    try {
      const file = Gio.File.new_for_path(this.path);
      this.monitor = file.monitor(Gio.FileMonitorFlags.NONE, null);
      this.monitor.connect('changed', (_m, _f, _o, event) => {
        if (
          event === Gio.FileMonitorEvent.CHANGES_DONE_HINT ||
          event === Gio.FileMonitorEvent.CREATED
        ) {
          this.load();
        }
      });
    } catch (e) {
      console.warn('Config: failed to watch file:', e);
    }
  }
}

export default new ConfigService();
