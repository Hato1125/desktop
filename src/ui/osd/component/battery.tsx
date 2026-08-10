import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';

import { type Osd } from '../index';

// Notify only when the battery drops to one of these levels, in descending order.
const LEVELS = [20, 10, 5];
const CRITICAL_LEVEL = 10;
// Percentage points the battery must recover by before a level can notify again.
const REARM_MARGIN = 2;

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

type Latch = {
  notified: number | null;
};

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

  // Lowest level the battery has dropped to, or null while above every level.
  const reachedLevel = (percent: number) => {
    let reached: number | null = null;

    for (const level of LEVELS) {
      if (percent <= level) reached = level;
    }

    return reached;
  };

  const evaluate = (device: AstalBattery.Device) => {
    const latch = latches.get(device);
    if (!latch) {
      return;
    }

    if (!device.isPresent || !device.isBattery || device.charging) {
      latch.notified = null;
      return;
    }

    const percent = Math.floor(device.percentage * 100);
    const level = reachedLevel(percent);

    if (level === null) {
      latch.notified = null;
      return;
    }

    // Recovered above the level we last notified about: re-arm it silently.
    if (latch.notified !== null && level > latch.notified) {
      if (percent > latch.notified + REARM_MARGIN) latch.notified = level;
      return;
    }

    // Still inside the level we already notified about.
    if (latch.notified !== null && level >= latch.notified) {
      return;
    }

    latch.notified = level;

    const name = deviceLabel(device);

    if (level <= CRITICAL_LEVEL) {
      osd.show(() => (<CriticalOSD name={name} percent={percent} />));
    } else {
      osd.show(() => (<LowOSD name={name} percent={percent} />));
    }
  };

  const watch = (device: AstalBattery.Device) => {
    if (device.deviceType === AstalBattery.Type.LINE_POWER) return;
    if (!device.isBattery) return;
    if (latches.has(device)) return;

    latches.set(device, { notified: null });
    device.connect('notify::percentage', () => evaluate(device));
    device.connect('notify::charging', () => evaluate(device));
    device.connect('notify::is-present', () => evaluate(device));
    device.connect('notify::state', () => evaluate(device));
    device.connect('notify::is-battery', () => evaluate(device));
    evaluate(device);
  };

  const syncDevices = () => {
    const devices = new Set(upower.devices);

    for (const device of latches.keys()) {
      if (!devices.has(device)) {
        latches.delete(device);
      }
    }

    upower.devices.forEach(watch);
  };

  syncDevices();
  upower.connect('device-added', (_, device: AstalBattery.Device) => {
    watch(device);
  });
  upower.connect('device-removed', (_, device: AstalBattery.Device) => {
    latches.delete(device);
  });
  upower.connect('notify::devices', () => {
    syncDevices();
  });
};
