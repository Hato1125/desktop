import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';
import { createBinding, createMemo } from 'ags';
import { defineComponent } from './component';

const battery = AstalBattery.get_default();

const LEVEL_NORMAL = ['level'];
const LEVEL_WARN = ['level', 'warn'];

export default () => {
  const isPresent = createBinding(battery, 'isPresent');
  const percentage = createBinding(battery, 'percentage');
  const charging = createBinding(battery, 'charging');

  const levelClasses = createMemo(() =>
    percentage() <= 0.2 ? LEVEL_WARN : LEVEL_NORMAL
  );

  const percentText = createMemo(() =>
    Math.floor(percentage() * 100).toString()
  );

  return defineComponent('battery', () => (
    <overlay class='battery' visible={isPresent}>
      <levelbar
        cssClasses={levelClasses}
        minValue={0}
        maxValue={1}
        value={percentage}
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
          visible={charging}
          cssClasses={[
            'symbols',
            'filled',
            'symbols-sm',
          ]}
          label='bolt'
        />
        <label
          cssClasses={[
            'text-sm',
            'tabular',
          ]}
          label={percentText}
        />
      </box>
    </overlay>
  ));
};
