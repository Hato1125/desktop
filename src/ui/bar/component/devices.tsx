import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';
import AstalBluetooth from 'gi://AstalBluetooth?version=0.1';
import { createBinding, createMemo, For } from 'ags';
import { defineComponent } from './component';

const TOUCHPAD_APPEARANCE = 0x03c9;

const icons: Map<AstalBattery.Type, string> = new Map([
  [AstalBattery.Type.MOUSE, 'mouse'],
  [AstalBattery.Type.KEYBOARD, 'keyboard'],
  [AstalBattery.Type.PHONE, 'mobile'],
  [AstalBattery.Type.SPEAKERS, 'speaker'],
  [AstalBattery.Type.GAMING_INPUT, 'stadia_controller'],
  [AstalBattery.Type.PEN, 'edit'],
  [AstalBattery.Type.HEADSET, 'headphones'],
  [AstalBattery.Type.HEADPHONES, 'headphones'],
  [AstalBattery.Type.BLUETOOTH_GENERIC, 'bluetooth'],
  [AstalBattery.Type.TOUCHPAD, 'touchpad_mouse'],
]);

const upowerDevices = createBinding(AstalBattery.UPower.new(), 'devices');
const bluetoothDevices = createBinding(AstalBluetooth.get_default(), 'devices');

const getDeviceType = (
  device: AstalBattery.Device,
  bluetooth: AstalBluetooth.Device[],
) => {
  if (device.deviceType !== AstalBattery.Type.BLUETOOTH_GENERIC) {
    return device.deviceType;
  }

  const bluetoothDevice = bluetooth.find(d => d.address === device.serial);
  return bluetoothDevice?.appearance === TOUCHPAD_APPEARANCE
    ? AstalBattery.Type.TOUCHPAD
    : device.deviceType;
};

const devices = createMemo(() => {
  const bluetooth = bluetoothDevices();

  return (upowerDevices() as AstalBattery.Device[]).filter(d =>
    d.deviceType !== AstalBattery.Type.LINE_POWER
    && d.isPresent
    && d.isBattery
    && icons.has(getDeviceType(d, bluetooth))
  ).sort(
    (a, b) => getDeviceType(a, bluetooth) - getDeviceType(b, bluetooth)
  );
});

const LEVEL_NORMAL = ['level'];
const LEVEL_WARN = ['level', 'warn'];

const Battery = ({ device }: { device: AstalBattery.Device }) => (
  <box
    class='devices'
    orientation={Gtk.Orientation.VERTICAL}
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    tooltipText={
      createBinding(device, 'percentage').as(p =>
        `${device.model} ${Math.floor(p * 100)}%`
      )
    }
  >
    <label
      cssClasses={[
        'symbols',
        'symbols-xl',
      ]}
      label={
        bluetoothDevices.as(bluetooth =>
          icons.get(getDeviceType(device, bluetooth)) ?? 'bluetooth'
        )
      }
    />
    <overlay>
      <levelbar
        class='level'
        cssClasses={
          createBinding(device, 'percentage').as(p =>
            p <= 0.2
              ? LEVEL_WARN
              : LEVEL_NORMAL
          )
        }
        minValue={0}
        maxValue={1}
        value={createBinding(device, 'percentage')}
        valign={Gtk.Align.CENTER}
        overflow={Gtk.Overflow.HIDDEN}
      />
      <label
        $type='overlay'
        visible={createBinding(device, 'state').as(s => s === AstalBattery.State.CHARGING)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        cssClasses={[
          'charging',
          'filled',
          'symbols',
          'symbols-base',
        ]}
        label='bolt'
      />
    </overlay>
  </box>
);

export default () => defineComponent('devices', () => (
  <box spacing={14} visible={createMemo(() => devices().length > 0)}>
    <For each={devices}>
      {(device) => <Battery device={device} />}
    </For>
  </box>
));
