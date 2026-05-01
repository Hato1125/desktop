import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';

export type Watch = {
  readonly stale: boolean;
  clear(): void;
};

const expand = (path: string) =>
  path === '~' || path.startsWith('~/') ? `${GLib.get_home_dir()}${path.slice(1)}` : path;

const retained: Gio.FileMonitor[] = [];

export const watchDirs = (paths: string[]): Watch => {
  let stale = true;
  for (const path of paths) {
    try {
      const monitor = Gio.File.new_for_path(expand(path))
        .monitor_directory(Gio.FileMonitorFlags.NONE, null);
      monitor.connect('changed', () => { stale = true; });
      retained.push(monitor);
    } catch (e) {
      console.warn(`watch: ${path}:`, e);
    }
  }
  return {
    get stale() { return stale; },
    clear: () => { stale = false; },
  };
};
