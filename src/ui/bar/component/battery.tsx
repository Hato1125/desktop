import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';

import { createBinding } from 'ags';

const battery = AstalBattery.get_default();

export default () => (
  <overlay class='battery' visible={createBinding(battery, 'isPresent')}>
    <levelbar
      cssClasses={
        createBinding(battery, 'percentage').as(p => {
          return p <= 0.2
            ? ['level', 'warn']
            : ['level']
        })
      }
      minValue={0}
      maxValue={1}
      value={createBinding(battery, 'percentage')}
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
        visible={createBinding(battery, 'charging')}
        cssClasses={[
          'symbols',
          'filled',
          'symbols-sm',
        ]}
        label='bolt'
      />
      <label
        class='text-sm'
        label={createBinding(battery, 'percentage').as(p => (Math.floor(p * 100)).toString())}
      />
    </box>
  </overlay>
);
