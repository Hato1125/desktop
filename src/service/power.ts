import GLib from 'gi://GLib?version=2.0';
import Gio from 'gi://Gio?version=2.0';
import GObject from 'gi://GObject?version=2.0';

import { register } from 'ags/gobject';
import { support, makeService } from 'src/feature/feature';

Gio._promisify(Gio.DBusProxy.prototype, 'call', 'call_finish');

@support({ os: [{ os: 'linux' }] })
@register()
class PowerService extends GObject.Object {
  private proxy: Gio.DBusProxy;

  constructor() {
    super();
    this.proxy = Gio.DBusProxy.new_for_bus_sync(
      Gio.BusType.SYSTEM,
      Gio.DBusProxyFlags.NONE,
      null,
      'org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager',
      null,
    );
  }

  private async call(method: string) {
    try {
      await this.proxy.call(
        method,
        new GLib.Variant('(b)', [true]),
        Gio.DBusCallFlags.NONE,
        5000,
        null,
      );
    } catch (e) {
      console.error(`power: ${method}`, e);
    }
  }

  powerOff = () => this.call('PowerOff');
  reboot = () => this.call('Reboot');
  suspend = () => this.call('Suspend');
}

export default makeService(PowerService);
