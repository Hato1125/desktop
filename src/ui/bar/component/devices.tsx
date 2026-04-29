import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';
import { createBinding, For } from 'ags';
import { defineComponent } from './component';

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
]);

const devices = createBinding(AstalBattery.UPower.new(), 'devices').as(
  (all) => (all as AstalBattery.Device[]).filter(d =>
    d.deviceType !== AstalBattery.Type.LINE_POWER
    && d.isPresent
    && d.isBattery
    && icons.has(d.deviceType)
  ).sort((a, b) => a.deviceType - b.deviceType)
);

const LEVEL_NORMAL = ['level'];
const LEVEL_WARN = ['level', 'warn'];

const Battery = ({ device }: { device: AstalBattery.Device }) => (
  <box
    class='devices'
    orientation={Gtk.Orientation.VERTICAL}
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    tooltipText={
      createBinding(device, 'percentage').as(p => {
        return `${device.model} ${Math.floor(p * 100)}%`
      })
    }
  >
    <label
      cssClasses={[
        'symbols',
        'symbols-xl',
      ]}
      label={icons.get(device.deviceType)}
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
  <box spacing={14} visible={devices.as(d => d.length > 0)}>
    <For each={devices}>
      {(device) => device && (
        <box>
          <Battery device={device} />
        </box>
      )}
    </For>
  </box>
));
