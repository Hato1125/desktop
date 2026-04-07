import Gtk from 'gi://Gtk?version=4.0';
import AstalBattery from 'gi://AstalBattery?version=0.1';

import { createState } from 'ags';

const battery = AstalBattery.get_default();

const [bt, setState] = createState({
  percentage: Math.floor(battery.percentage * 100),
  charging: battery.charging,
  present: battery.is_present,
});

const update = () => {
  setState({
    percentage: Math.floor(battery.percentage * 100),
    charging: battery.charging,
    present: battery.is_present,
  });
}

battery.connect('notify::percentage', update);
battery.connect('notify::charging', update);

const Bar = () => (
  <levelbar
    class='level'
    minValue={0}
    maxValue={100}
    value={bt.as((state) => state.percentage)}
    overflow={Gtk.Overflow.HIDDEN}
  />
);

const Parcentage = () => (
  <label
    cssClasses={[
      'percentage',
      'label-body-m'
    ]}
    label={bt.as((state) => state.percentage.toString())}
  />
);

const ChargingIcon = () => (
  <label
    visible={bt.as((state) => state.charging)}
    cssClasses={[
      'symbols',
      'symbol-xs2',
    ]}
    label='bolt'
  />
);

const State = () => (
  <box halign={Gtk.Align.CENTER}>
    <ChargingIcon />
    <Parcentage />
  </box>
);

const Battery = () => {
  const overlay = new Gtk.Overlay();

  const bar = <Bar/> as Gtk.Box;
  const state = <State/> as Gtk.Box;

  bar.valign = Gtk.Align.CENTER;

  overlay.set_child(bar);
  overlay.add_overlay(state);
  return overlay;
}

export default () => (
  <box class='battery' visible={bt.as((state) => state.present)}>
    <Battery />
  </box>
);
