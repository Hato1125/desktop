import Gtk from 'gi://Gtk?version=4.0';

import { createState } from 'ags';

const [lockIcon, setLockIcon] = createState('');
const [lockLabel, setLockLabel] = createState('');

export const setKeyLock = (icon: string, label: string) => {
  setLockIcon(icon);
  setLockLabel(label);
};

export default () => (
  <box
    class='keylock'
    valign={Gtk.Align.CENTER}
    spacing={14}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-xl',
      ]}
      label={lockIcon}
    />
    <label
      valign={Gtk.Align.CENTER}
      hexpand={true}
      label={lockLabel}
    />
  </box>
);
