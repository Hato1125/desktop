import { createBinding } from 'ags';
import { VpnService } from '@service/vpn';

const vpn = VpnService.get_default();

export default () => (
  <box class='vpn' visible={createBinding(vpn, 'connected')}>
    <label
      cssClasses={[
        'filled',
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
);
