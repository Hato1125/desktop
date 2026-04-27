import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import GObject from 'gi://GObject?version=2.0';

import {
  register,
  property,
} from 'ags/gobject';
import { readFile } from 'ags/file';

import { support } from 'src/feature/feature';

function findKeyboardDevice(): string | null {
  const text = readFile('/proc/bus/input/devices');

  for (const line of text.split('\n')) {
    const match = line.match(/event(\d+)/);

    if (!match
      || !line.startsWith('H:')
      || !line.includes('leds')
    ) continue;

    const path = `/dev/input/event${match[1]}`;
    try {
      Gio.File.new_for_path(path).read(null);
      return path;
    } catch {
      continue;
    }
  }
  return null;
}

const EV_LED = 17;
const LED_NUML = 0;
const LED_CAPSL = 1;
const EVENT_SIZE = 24;
const RETRY_INTERVAL = 5000;

@support({
  os: [{ os: 'linux' }]
})
@register()
export class KeyLockService extends GObject.Object {
  @property(Boolean) capsLock: boolean = false;
  @property(Boolean) numLock: boolean = false;

  onCapsLockChanged: ((active: boolean) => void) | null = null;
  onNumLockChanged: ((active: boolean) => void) | null = null;

  private stream: Gio.FileInputStream | null = null;

  constructor() {
    super();
    this.watch();
  }

  private watch() {
    const device = findKeyboardDevice();
    if (!device) {
      console.warn('KeyLock: no keyboard device found, retrying in 5s');
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, RETRY_INTERVAL, () => {
        this.watch();
        return GLib.SOURCE_REMOVE;
      });
      return;
    }

    try {
      this.stream = Gio.File.new_for_path(device).read(null);
      this.read(this.stream);
    } catch (e) {
      console.warn('KeyLock: failed to open device:', e);
    }
  }

  private read(stream: Gio.InputStream) {
    stream.read_bytes_async(EVENT_SIZE, GLib.PRIORITY_DEFAULT, null, (_src, res) => {
      try {
        const bytes = stream.read_bytes_finish(res);
        if (bytes && bytes.get_size() === EVENT_SIZE) {
          this.handleEvent(bytes.get_data()!);
        }
        this.read(stream);
      } catch {
        console.warn('KeyLock: device disconnected, reconnecting...');
        try { stream.close(null); } catch { /* ignore */ }
        this.stream = null;
        this.watch();
      }
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
