import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';

import { createBinding, For } from 'ags';

const upower = AstalBattery.UPower.new();

const devices = createBinding(upower, 'devices').as(
  (all: AstalBattery.Device[]) => all.filter(d =>
    d.deviceType !== AstalBattery.Type.LINE_POWER && d.isPresent
  )
);

const Battery = ({ device }: { device: AstalBattery.Device }) => {
  const icons: Map<AstalBattery.Type, string> = new Map([
    [AstalBattery.Type.KEYBOARD, 'keyboard'],
    [AstalBattery.Type.MOUSE, 'mouse'],
    [AstalBattery.Type.HEADSET, 'headphones'],
  ]);

  if (device.deviceType === AstalBattery.Type.HEADPHONES) {
    return (
      <box>
        {/* TODO */}
      </box>
    );
  }

  return (
    <box
      class='devices'
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      tooltipText={device.model}
    >

      <overlay class='battery'>
        <levelbar
          class='level'
          minValue={0}
          maxValue={1}
          value={createBinding(device, 'percentage')}
          valign={Gtk.Align.CENTER}
          overflow={Gtk.Overflow.HIDDEN}
        />
        <box
          $type='overlay'
          spacing={2}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        >
          <label
            cssClasses={[
              'symbols',
              'symbol-s1',
            ]}
            label={icons.get(device.deviceType)}
          />
          <label
            $type='overlay'
            class='label-body-m'
            label={createBinding(device, 'percentage').as(p => (p * 100).toString())}
          />
        </box>
      </overlay>
    </box>
  );
}

export default () => (
  <box spacing={14} visible={devices.as(d => d.length > 0)}>
    <For each={devices}>
      {(device) => device && (
        <box>
          <Battery device={device} />
        </box>
      )}
    </For>
  </box>
);
