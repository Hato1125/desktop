import { createBinding } from 'ags';
import { defineComponent } from './component';
import vpn from '@service/vpn';

export default () => {
  if (!vpn) {
    return null;
  }

  const connected = createBinding(vpn, 'connected');
  const country = createBinding(vpn, 'country');

  return defineComponent('vpn', () => (
    <box
      class='vpn'
      spacing={4}
      visible={connected}
      tooltipText={country.as(country => `VPN ${country}`)}
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
        label={country}
      />
    </box>
  ));
};
