import AstalNetwork from 'gi://AstalNetwork?version=0.1';
import { createBinding, createMemo, With } from 'ags';
import { defineComponent } from './component';

const network = AstalNetwork.get_default();

const Unavailable = ({ tooltip }: { tooltip: string }) => (
  <label
    tooltipText={tooltip}
    cssClasses={[
      'filled',
      'symbols',
      'symbols-xl'
    ]}
    label='priority_high'
  />
);

const Wired = ({ wired }: { wired: AstalNetwork.Wired | null }) => {
  if (!wired) {
    return <Unavailable tooltip='Wired adapter unavailable' />;
  }

  return (
    <label
      tooltipMarkup={createBinding(wired, 'device').as(d => d.perm_hw_address)}
      cssClasses={['filled', 'symbols', 'symbols-lg']}
      label={
        createBinding(wired, 'state')
          .as(state =>
            state === AstalNetwork.DeviceState.ACTIVATED
              ? 'automation'
              : 'signal_disconnected'
          )
      }
    />
  );
};

const WiFi = ({ wifi }: { wifi: AstalNetwork.Wifi | null }) => {
  if (!wifi) {
    return <Unavailable tooltip='Wi-Fi adapter unavailable' />;
  }

  const state = createBinding(wifi, 'state');
  const strength = createBinding(wifi, 'strength');

  const icon = createMemo(() =>
    state() !== AstalNetwork.DeviceState.ACTIVATED
      ? 'wifi_off'
      : strength() >= 67 ? 'wifi'
      : strength() >= 34 ? 'wifi_2_bar'
      : 'wifi_1_bar'
  );

  return (
    <label
      tooltipMarkup={createBinding(wifi, 'ssid')}
      cssClasses={[
        'filled',
        'symbols',
        'symbols-xl'
      ]}
      label={icon}
    />
  );
};

const Unknown = () => (
  <Unavailable tooltip='Network status unavailable' />
);

export default () => defineComponent('network', () => (
  <box>
    <With value={createBinding(network, 'primary')}>
      {(primary) => {
        switch (primary) {
          case AstalNetwork.Primary.WIRED: return <Wired wired={network.wired} />
          case AstalNetwork.Primary.WIFI: return <WiFi wifi={network.wifi} />
          case AstalNetwork.Primary.UNKNOWN: return <Unknown />
        }
      }}
    </With>
  </box>
));
