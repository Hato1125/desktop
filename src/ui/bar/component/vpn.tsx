import { createBinding } from 'ags';
import { VpnService } from '@service/vpn';

const vpn = VpnService.get_default();

export default () => (
  <revealer
    revealChild={createBinding(vpn, 'connected')}
    transitionType={1}
    transitionDuration={300}
  >
    <box class='vpn'>
      <label
        cssClasses={[
          'symbols',
          'symbols-base'
        ]}
        label='vpn_key'
      />
      <label
        cssClasses={[
          'country',
          'text-xs'
        ]}
        label={createBinding(vpn, 'country')}
      />
    </box>
  </revealer>
);
