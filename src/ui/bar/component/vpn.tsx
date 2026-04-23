import { createBinding } from 'ags';
import { defineComponent } from './component';
import vpn from '@service/vpn';

export default () => defineComponent('vpn', () => (
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
));
