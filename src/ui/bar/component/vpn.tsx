import { createBinding } from 'ags';
import { defineComponent } from './component';
import vpn from '@service/vpn';

export default () => {
  if (!vpn) return null;
  const v = vpn;

  return defineComponent('vpn', () => (
    <box class='vpn' visible={createBinding(v, 'connected')}>
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
        label={createBinding(v, 'country')}
      />
    </box>
  ));
};
