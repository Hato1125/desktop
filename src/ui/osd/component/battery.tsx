import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';

import { type Osd } from '../index';

const LOW_THRESHOLD = 0.2;
const CRITICAL_THRESHOLD = 0.1;
const REMINDER_INTERVAL_SECONDS = 5 * 60;

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
  low: boolean;
  critical: boolean;
  reminderId: number | null;
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

  const stopReminder = (latch: Latch) => {
    if (latch.reminderId === null) return;

    GLib.source_remove(latch.reminderId);
    latch.reminderId = null;
  };

  const reset = (latch: Latch) => {
    latch.low = false;
    latch.critical = false;
    stopReminder(latch);
  };

  const isWarningLow = (level: AstalBattery.WarningLevel) =>
    level === AstalBattery.WarningLevel.LOW
    || level === AstalBattery.WarningLevel.CRITICIAL
    || level === AstalBattery.WarningLevel.ACTION;

  const isWarningCritical = (level: AstalBattery.WarningLevel) =>
    level === AstalBattery.WarningLevel.CRITICIAL
    || level === AstalBattery.WarningLevel.ACTION;

  const isBatteryLevelLow = (level: AstalBattery.BatteryLevel) =>
    level === AstalBattery.BatteryLevel.LOW
    || level === AstalBattery.BatteryLevel.CRITICIAL;

  const isBatteryLevelCritical = (level: AstalBattery.BatteryLevel) =>
    level === AstalBattery.BatteryLevel.CRITICIAL;

  const evaluate = (device: AstalBattery.Device, force = false) => {
    const latch = latches.get(device);
    if (!latch) {
      return;
    }

    if (!device.isPresent || !device.isBattery || device.charging) {
      reset(latch);
      return;
    }

    const percentage = device.percentage;
    const warningLevel = device.warningLevel;
    const batteryLevel = device.batteryLevel;
    const isCritical = percentage <= CRITICAL_THRESHOLD
      || isWarningCritical(warningLevel)
      || isBatteryLevelCritical(batteryLevel);
    const isLow = isCritical
      || percentage <= LOW_THRESHOLD
      || isWarningLow(warningLevel)
      || isBatteryLevelLow(batteryLevel);

    if (!isLow) {
      reset(latch);
      return;
    }

    if (latch.reminderId === null) {
      latch.reminderId = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        REMINDER_INTERVAL_SECONDS,
        () => {
          evaluate(device, true);
          return GLib.SOURCE_CONTINUE;
        },
      );
    }

    const percent = Math.floor(percentage * 100);
    const name = deviceLabel(device);

    if (isCritical && (force || !latch.critical)) {
      latch.critical = true;
      latch.low = true;
      osd.show(() => (<CriticalOSD name={name} percent={percent} />));
    } else if (force || !latch.low) {
      latch.low = true;
      osd.show(() => (<LowOSD name={name} percent={percent} />));
    }
  };

  const watch = (device: AstalBattery.Device) => {
    if (device.deviceType === AstalBattery.Type.LINE_POWER) return;
    if (!device.isBattery) return;
    if (latches.has(device)) return;

    latches.set(device, { low: false, critical: false, reminderId: null });
    device.connect('notify::percentage', () => evaluate(device));
    device.connect('notify::charging', () => evaluate(device));
    device.connect('notify::is-present', () => evaluate(device));
    device.connect('notify::state', () => evaluate(device));
    device.connect('notify::warning-level', () => evaluate(device));
    device.connect('notify::battery-level', () => evaluate(device));
    device.connect('notify::is-battery', () => evaluate(device));
    evaluate(device);
  };

  const syncDevices = () => {
    const devices = new Set(upower.devices);

    for (const [device, latch] of latches) {
      if (!devices.has(device)) {
        stopReminder(latch);
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
    const latch = latches.get(device);
    if (latch) {
      stopReminder(latch);
      latches.delete(device);
    }
  });
  upower.connect('notify::devices', () => {
    syncDevices();
  });
};
