import Gtk from 'gi://Gtk?version=4.0';

import gamemode from '@service/gamemode';

import { type Osd } from '../index';

export default (osd: Osd) => {
  if (!gamemode) return;

  gamemode.onRegistered = (game) => {
    osd.show(() => (
      <box
        class='osd-pill gamemode'
        valign={Gtk.Align.CENTER}
        spacing={14}
      >
        <label
          cssClasses={['filled', 'symbols', 'symbols-xl']}
          label='rocket_launch'
        />
        <label
          valign={Gtk.Align.CENTER}
          hexpand={true}
          label={game.name}
        />
      </box>
    ));
  };
};
