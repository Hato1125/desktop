import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import { readFile } from 'ags/file';

export default () => {
  const distro = readFile('/etc/os-release')
    .split('\n')
    .find((line) => line.startsWith('ID='))
    ?.split('=')[1] ?? 'linux';

  let popupvar: Gtk.Popover;

  const login1 = Gio.DBusProxy.new_for_bus_sync(
    Gio.BusType.SYSTEM,
    Gio.DBusProxyFlags.NONE,
    null,
    'org.freedesktop.login1',
    '/org/freedesktop/login1',
    'org.freedesktop.login1.Manager',
    null,
  );

  const powerOff = () => login1.call_sync('PowerOff', new GLib.Variant('(b)', [true]), Gio.DBusCallFlags.NONE, -1, null);
  const reboot = () => login1.call_sync('Reboot', new GLib.Variant('(b)', [true]), Gio.DBusCallFlags.NONE, -1, null);
  const suspend = () => login1.call_sync('Suspend', new GLib.Variant('(b)', [true]), Gio.DBusCallFlags.NONE, -1, null);

  return (
    <box>
      <button onClicked={() => popupvar.popup()}>
        <image class='symbols-lg' iconName={`${distro}-symbolic`} />
      </button>

      <Gtk.Popover $={(ref) => (popupvar = ref)} hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
          <button onClicked={() => powerOff()}>
            <box spacing={8}>
              <label
                cssClasses={[
                  'symbols',
                  'symbols-xl',
                ]}
                label='power_off'
              />
              <label
                cssClasses={[
                  'label',
                  'text-base',
                ]}
                label='Shutdown'
              />
            </box>
          </button>
          <button onClicked={() => reboot()}>
            <box spacing={8}>
              <label
                cssClasses={[
                  'symbols',
                  'symbols-xl',
                ]}
                label='restart_alt'
              />
              <label
                cssClasses={[
                  'label',
                  'text-base',
                ]}
                label='Restart'
              />
            </box>
          </button>
          <button onClicked={() => suspend()}>
            <box spacing={8}>
              <label
                cssClasses={[
                  'symbols',
                  'symbols-xl',
                ]}
                label='bedtime'
              />
              <label
                cssClasses={[
                  'label',
                  'text-base',
                ]}
                label='Sleep'
              />
            </box>
          </button>
        </box>
      </Gtk.Popover>
    </box>
  );
}
