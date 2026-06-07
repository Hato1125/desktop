import { createBinding } from 'ags';
import { defineComponent } from './component';
import vpn from '@service/vpn';

export default () => {
  if (!vpn) return null;
  const v = vpn;

  return defineComponent('vpn', () => (
    <box
      class='vpn'
      spacing={4}
      visible={createBinding(v, 'connected')}
      tooltipText={createBinding(v, 'country').as(country => `VPN ${country}`)}
    >
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
          'text-sm',
          'tabular'
        ]}
        label={createBinding(v, 'country')}
      />
    </box>
  ));
};
