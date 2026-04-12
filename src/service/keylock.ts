import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import GObject from 'gi://GObject?version=2.0';

import {
  register,
  property,
} from 'ags/gobject';

const KBD_DEVICE = '/dev/input/by-id/usb-hfd.cn_USB_DEVICE-event-kbd';

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

    const proc = Gio.Subprocess.new(
      ['cat', KBD_DEVICE],
      Gio.SubprocessFlags.STDOUT_PIPE,
    );

    const stdout = proc.get_stdout_pipe()!;
    this.read(stdout);
  }

  private read(stream: Gio.InputStream) {
    stream.read_bytes_async(EVENT_SIZE, GLib.PRIORITY_DEFAULT, null, (_src, res) => {
      try {
        const bytes = stream.read_bytes_finish(res);
        if (bytes && bytes.get_size() === EVENT_SIZE) {
          this.handleEvent(bytes.get_data()!);
        }
      } catch (e) {
        console.error('KeyLock:', e);
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
