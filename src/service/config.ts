import GObject from 'gi://GObject?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import Gio from 'gi://Gio?version=2.0';

import { readFile } from 'ags/file';
import {
  register,
  property,
} from 'ags/gobject';

type BarAnchor = 'top' | 'bottom';

const assign = <T extends GObject.Object, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K],
) => {
  if (obj[key] !== value) obj[key] = value;
};

@register()
export class BarConfig extends GObject.Object {
  @property(String) anchor: BarAnchor = 'top';

  load(data: any) {
    assign(this, 'anchor', data?.anchor ?? 'top');
  }
}

@register()
export class DockConfig extends GObject.Object {
  @property(Boolean) enable: boolean = true;
  @property(Object) apps: string[] = [];

  load(data: any) {
    assign(this, 'enable', data?.enable ?? true);
    this.apps = data?.apps ?? [];
  }
}

@register()
export class ConfigService extends GObject.Object {
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
      console.error('config: failed to load', e);
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
      console.warn('config: failed to watch file:', e);
    }
  }
}

export default new ConfigService();
