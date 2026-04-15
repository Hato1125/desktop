import Gtk from 'gi://Gtk?version=4.0';

import { createState } from 'ags';

const [bluetoothLabel, setBluetoothLabel] = createState('');

export const setBluetooth = (name: string) => {
  setBluetoothLabel(name);
};

export default () => (
  <box
    class='bluetooth'
    valign={Gtk.Align.CENTER}
    spacing={14}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-xl',
      ]}
      label='bluetooth'
    />
    <label
      valign={Gtk.Align.CENTER}
      hexpand={true}
      label={bluetoothLabel}
    />
  </box>
);
