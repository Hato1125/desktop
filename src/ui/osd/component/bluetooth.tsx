import Gtk from 'gi://Gtk?version=4.0';
import AstalBluetooth from 'gi://AstalBluetooth?version=0.1';

import { type Osd } from '../index';

export default (osd: Osd) => {
  const bluetooth = AstalBluetooth.get_default();

  const watchDevice = (device: AstalBluetooth.Device) => {
    device.connect('notify::connected', () => {
      osd.show(() => (
        <box
          class='osd-pill bluetooth'
          valign={Gtk.Align.CENTER}
          spacing={14}
        >
          <label
            cssClasses={['filled', 'symbols', 'symbols-xl']}
            label='bluetooth'
          />
          <label
            valign={Gtk.Align.CENTER}
            hexpand={true}
            label={device.name}
          />
        </box>
      ));
    });
  };

  bluetooth.devices.forEach(watchDevice);
  bluetooth.connect('device-added', (_, device: AstalBluetooth.Device) => {
    watchDevice(device);
  });
};
