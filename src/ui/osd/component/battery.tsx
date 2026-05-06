import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';

import { type Osd } from '../index';

const LOW_THRESHOLD = 0.2;
const CRITICAL_THRESHOLD = 0.1;

const typeNames: Map<AstalBattery.Type, string> = new Map([
  [AstalBattery.Type.BATTERY, 'Battery'],
  [AstalBattery.Type.MOUSE, 'Mouse'],
  [AstalBattery.Type.KEYBOARD, 'Keyboard'],
  [AstalBattery.Type.PHONE, 'Phone'],
  [AstalBattery.Type.SPEAKERS, 'Speaker'],
  [AstalBattery.Type.GAMING_INPUT, 'Controller'],
  [AstalBattery.Type.PEN, 'Pen'],
  [AstalBattery.Type.HEADSET, 'Headset'],
  [AstalBattery.Type.HEADPHONES, 'Headphones'],
  [AstalBattery.Type.BLUETOOTH_GENERIC, 'Bluetooth device'],
]);

const deviceLabel = (device: AstalBattery.Device) =>
  device.model || typeNames.get(device.deviceType) || 'Battery';

type Latch = { low: boolean; critical: boolean };

const LowOSD = ({ name, percent }: { name: string, percent: number }) => (
  <box
      class='osd-pill battery'
      valign={Gtk.Align.CENTER}
      spacing={14}
    >
      <label
        cssClasses={[
          'filled',
          'symbols',
          'symbols-xl',
        ]}
        label='battery_alert'
      />
      <label
        hexpand
        class='text-base'
        valign={Gtk.Align.CENTER}
        label={`${name} low · ${percent}%`}
      />
    </box>
);

const CriticalOSD = ({ name, percent }: { name: string, percent: number }) => (
  <box
    class='osd-pill battery critical'
    valign={Gtk.Align.CENTER}
    spacing={14}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-xl',
      ]}
      label='battery_alert'
    />
    <label
      hexpand
      class='text-base'
      valign={Gtk.Align.CENTER}
      label={`${name} critical · ${percent}%`}
    />
  </box>
);


export default (osd: Osd) => {
  const upower = AstalBattery.UPower.new();
  const latches = new Map<AstalBattery.Device, Latch>();

  const evaluate = (device: AstalBattery.Device) => {
    const latch = latches.get(device);
    if (!latch) {
      return;
    }

    if (!device.isPresent || !device.isBattery || device.charging) {
      latch.low = false;
      latch.critical = false;
      return;
    }

    const percentage = device.percentage;

    if (percentage > LOW_THRESHOLD) {
      latch.low = false;
      latch.critical = false;
      return;
    }

    const percent = Math.floor(percentage * 100);
    const name = deviceLabel(device);

    if (percentage <= CRITICAL_THRESHOLD && !latch.critical) {
      latch.critical = true;
      latch.low = true;
      osd.show(() => (<CriticalOSD name={name} percent={percent} />));
    } else if (!latch.low) {
      latch.low = true;
      osd.show(() => (<LowOSD name={name} percent={percent} />));
    }
  };

  const watch = (device: AstalBattery.Device) => {
    if (device.deviceType === AstalBattery.Type.LINE_POWER) return;
    if (!device.isBattery) return;
    if (latches.has(device)) return;

    latches.set(device, { low: false, critical: false });
    device.connect('notify::percentage', () => evaluate(device));
    device.connect('notify::charging', () => evaluate(device));
    device.connect('notify::is-present', () => evaluate(device));
    evaluate(device);
  };

  upower.devices.forEach(watch);
  upower.connect('device-added', (_, device: AstalBattery.Device) => {
    watch(device);
  });
};
