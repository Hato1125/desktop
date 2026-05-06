import Gtk from 'gi://Gtk?version=4.0';

import keylock from '@service/keylock';

import { type Osd } from '../index';

export default (osd: Osd) => {
  if (!keylock) return;

  keylock.onCapsLockChanged = (active) => {
    osd.show(() => (
      <box
        class='osd-pill keylock'
        valign={Gtk.Align.CENTER}
        spacing={14}
      >
        <label
          cssClasses={['filled', 'symbols', 'symbols-xl']}
          label={active ? 'shift_lock' : 'shift_lock_off'}
        />
        <label
          valign={Gtk.Align.CENTER}
          hexpand={true}
          label={active ? 'Caps Lock ON' : 'Caps Lock OFF'}
        />
      </box>
    ));
  };

  keylock.onNumLockChanged = (active) => {
    osd.show(() => (
      <box
        class='osd-pill keylock'
        valign={Gtk.Align.CENTER}
        spacing={14}
      >
        <label
          cssClasses={['filled', 'symbols', 'symbols-xl']}
          label={active ? 'grid_view' : 'grid_off'}
        />
        <label
          valign={Gtk.Align.CENTER}
          hexpand={true}
          label={active ? 'Num Lock ON' : 'Num Lock OFF'}
        />
      </box>
    ));
  };
};
