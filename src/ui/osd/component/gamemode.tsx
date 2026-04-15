import Gtk from 'gi://Gtk?version=4.0';

import { createState } from 'ags';

const [gameName, setGameName] = createState('');

export const setGamemodeName = (name: string) => setGameName(name);

export default () => (
  <box
    class='gamemode'
    valign={Gtk.Align.CENTER}
    spacing={14}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-xl'
      ]}
      label='rocket_launch'
    />
    <label
      valign={Gtk.Align.CENTER}
      hexpand={true}
      label={gameName}
    />
  </box>
);
