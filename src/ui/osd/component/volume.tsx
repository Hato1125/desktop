import Gtk from 'gi://Gtk?version=4.0';
import AstalWp from 'gi://AstalWp?version=0.1';
import { createBinding, With } from 'ags';

const speaker = AstalWp.get_default().defaultSpeaker;

export default () => (
  <box
    class='volume'
    valign={Gtk.Align.CENTER}
    spacing={14}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-xl'
      ]}
      label='volume_up'
    />
    <levelbar
      valign={Gtk.Align.CENTER}
      hexpand={true}
      minValue={0}
      maxValue={1}
      value={createBinding(speaker, 'volume')}
    />
  </box>
);
