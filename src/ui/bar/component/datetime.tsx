import Gtk from 'gi://Gtk?version=4.0'
import GLib from 'gi://GLib?version=2.0'
import { createMemo, createState } from 'ags';
import { timeout } from 'ags/time'

const [now, setNow] = createState(GLib.DateTime.new_now_local());

const tick = () => {
  const current = GLib.DateTime.new_now_local();
  setNow(current);
  const delay = Math.max(1000, Math.round((60 - current.get_seconds()) * 1000));
  timeout(delay, tick);
};

tick();

export default () => (
  <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
    <label
      cssClasses={[
        'label',
        'text-base',
        'tabular',
      ]}
      halign={Gtk.Align.END}
      label={createMemo(() => now().format('%-m/%-d')!)}
    />
    <label
      cssClasses={[
        'label',
        'text-base',
        'tabular',
      ]}
      halign={Gtk.Align.END}
      label={createMemo(() => now().format('%-I:%M')!)}
    />
    <label
      cssClasses={[
        'label',
        'text-base',
        'tabular',
      ]}
      halign={Gtk.Align.END}
      label={createMemo(() => now().format('%p')!)}
    />
  </box>
);
