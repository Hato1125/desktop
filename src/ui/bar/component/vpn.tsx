import { createBinding } from 'ags';

import { VpnService } from '@service/vpn';

export default () => {
  const vpn = VpnService.get_default();

  return (
    <revealer
      revealChild={createBinding(vpn, 'connected')}
      transitionType={1}
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
}
