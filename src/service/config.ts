import GObject from 'gi://GObject?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import Gio from 'gi://Gio?version=2.0';

import { readFile } from 'ags/file';
import {
  register,
  property,
} from 'ags/gobject';

type BarAnchor = 'top' | 'bottom';

@register()
export class ConfigService extends GObject.Object {
  @property(String) barAnchor: BarAnchor = 'top';
  @property(Boolean) dockEnable: boolean = true;
  @property(Object) dockApps: string[] = [];

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

      const barAnchor: BarAnchor = json?.bar?.anchor ?? 'top';
      const dockEnable: boolean = json?.dock?.enable ?? true;
      const dockApps: string[] = json?.dock?.apps ?? [];

      if (this.barAnchor !== barAnchor) this.barAnchor = barAnchor;
      if (this.dockEnable !== dockEnable) this.dockEnable = dockEnable;
      this.dockApps = dockApps;
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
