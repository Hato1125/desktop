import Gtk from 'gi://Gtk?version=4.0';

import { createBinding } from 'ags';

import { VpnService } from '../../../service/vpn';

const vpn = new VpnService();

export default () => (
  <revealer
    revealChild={createBinding(vpn, 'connected')}
    transitionType={Gtk.RevealerTransitionType.CROSSFADE}
    transitionDuration={300}
  >
    <box class='vpn'>
      <label
        cssClasses={[
          'symbols',
          'symbol-s1'
        ]}
        label='vpn_key'
      />
      <label
        cssClasses={[
          'country',
          'label-body-s'
        ]}
        label={createBinding(vpn, 'country')}
      />
    </box>
  </revealer>
);
