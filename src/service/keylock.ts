import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import GObject from 'gi://GObject?version=2.0';

import {
  register,
  property,
} from 'ags/gobject';

function findKeyboardDevice(): string | null {
  const file = Gio.File.new_for_path('/proc/bus/input/devices');
  const [, contents] = file.load_contents(null);
  const text = new TextDecoder().decode(contents);

  for (const line of text.split('\n')) {
    if (!line.startsWith('H:')) continue;
    if (!line.includes('leds')) continue;
    const match = line.match(/event(\d+)/);
    if (match) {
      const path = `/dev/input/event${match[1]}`;
      try {
        Gio.File.new_for_path(path).read(null);
        return path;
      } catch {
        continue;
      }
    }
  }
  return null;
}

const EV_LED = 17;
const LED_NUML = 0;
const LED_CAPSL = 1;
const EVENT_SIZE = 24;

@register()
export class KeyLockService extends GObject.Object {
  @property(Boolean) capsLock: boolean = false;
  @property(Boolean) numLock: boolean = false;

  onCapsLockChanged: ((active: boolean) => void) | null = null;
  onNumLockChanged: ((active: boolean) => void) | null = null;

  constructor() {
    super();
    this.watch();
  }

  private watch() {
    try {
      const device = findKeyboardDevice();
      if (!device) {
        console.warn('KeyLock: no keyboard device found, retrying in 5s');
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
          this.watch();
          return GLib.SOURCE_REMOVE;
        });
        return;
      }

      const proc = Gio.Subprocess.new(
        ['cat', device],
        Gio.SubprocessFlags.STDOUT_PIPE,
      );

      const stdout = proc.get_stdout_pipe()!;
      this.read(stdout);
    } catch (e) {
      console.warn('KeyLock: failed to start:', e);
    }
  }

  private read(stream: Gio.InputStream) {
    stream.read_bytes_async(EVENT_SIZE, GLib.PRIORITY_DEFAULT, null, (_src, res) => {
      try {
        const bytes = stream.read_bytes_finish(res);
        if (bytes && bytes.get_size() === EVENT_SIZE) {
          this.handleEvent(bytes.get_data()!);
        }
      } catch {
        console.warn('KeyLock: device disconnected, reconnecting...');
        this.watch();
        return;
      }

      this.read(stream);
    });
  }

  private handleEvent(data: Uint8Array) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const type = view.getUint16(16, true);
    const code = view.getUint16(18, true);
    const value = view.getInt32(20, true);

    if (type !== EV_LED) return;

    if (code === LED_CAPSL) {
      const active = value === 1;
      if (active !== this.capsLock) {
        this.capsLock = active;
        this.onCapsLockChanged?.(active);
      }
    } else if (code === LED_NUML) {
      const active = value === 1;
      if (active !== this.numLock) {
        this.numLock = active;
        this.onNumLockChanged?.(active);
      }
    }
  }
}

export default new KeyLockService();
