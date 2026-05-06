import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import AstalWp from 'gi://AstalWp?version=0.1';

import { createBinding } from 'ags';

import { type Osd } from '../index';

export default (osd: Osd) => {
  const speaker = AstalWp.get_default().defaultSpeaker;
  let handle: ReturnType<Osd['show']> | null = null;
  let ready = false;

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
    ready = true;
    return GLib.SOURCE_REMOVE;
  });

  speaker.connect('notify::volume', () => {
    if (!ready) return;

    if (handle) {
      handle.resetTimeout();
      return;
    }

    handle = osd.show(
      () => (
        <box
          class='osd-pill volume'
          valign={Gtk.Align.CENTER}
          spacing={14}
        >
          <label
            cssClasses={[
              'filled',
              'symbols',
              'symbols-xl',
            ]}
            label='volume_up'
          />
          <levelbar
            valign={Gtk.Align.CENTER}
            hexpand={true}
            minValue={0}
            maxValue={1.25}
            value={createBinding(speaker, 'volume')}
          />
        </box>
      ),
      () => { handle = null; },
    );
  });
};
