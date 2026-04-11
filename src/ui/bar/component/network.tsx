import AstalNetwork from 'gi://AstalNetwork?version=0.1';
import { createBinding, With } from 'ags';

const network = AstalNetwork.get_default();

const Wired = ({ wired }: { wired: AstalNetwork.Wired }) => (
  <label
    tooltipMarkup={createBinding(wired, 'device').as(d => d.perm_hw_address)}
    cssClasses={['symbols', 'symbols-lg']}
    label={
      network.wired.state === AstalNetwork.DeviceState.ACTIVATED
        ? 'automation'
        : 'signal_disconnected'
    }
  />
);

const WiFi = ({ wifi }: { wifi: AstalNetwork.Wifi}) => (
  <label
    tooltipMarkup={createBinding(wifi, 'ssid')}
    cssClasses={['symbols', 'symbols-xl']}
    label={
      network.wifi.state !== AstalNetwork.DeviceState.ACTIVATED
        ? 'wifi_off'
        : network.wifi.strength >= 67 ? 'wifi' :
          network.wifi.strength >= 34 ? 'wifi_2_bar' : 'wifi_1_bar'
    }
  />
);

const Unknown = () => (<label class='symbols' label='android_wifi_3_bar_off' />);

export default () => (
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
);
