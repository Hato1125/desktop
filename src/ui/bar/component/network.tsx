import Gtk from 'gi://Gtk?version=4.0';
import AstalNetwork from 'gi://AstalNetwork?version=0.1';

import { createBinding, With } from 'ags';

const WiredIcon = ({ wired }: { wired: AstalNetwork.Wired | null }) => (
  <label
    class='symbols'
    label={
      wired && wired.state === AstalNetwork.DeviceState.ACTIVATED
        ? 'cable'
        : 'signal_disconnected'
    }
  />
);

const WifiIcon = ({ wifi }: { wifi: AstalNetwork.Wifi | null }) => {
  if (!wifi) {
    return <label class='symbols' label='wifi_off' />
  }

  const derived = createBinding(wifi, 'strength').as((strength) => ({
    strength,
    state: wifi.state,
  }));

  return (
    <With value={derived}>
      {({ strength, state }) => {
        if (state !== AstalNetwork.DeviceState.ACTIVATED)
          return <label class='symbols' label='wifi_off' />;

        const icon =
          strength >= 80 ? 'wifi' :
          strength >= 60 ? 'network_wifi_3_bar' :
          strength >= 40 ? 'network_wifi_2_bar' :
          strength >= 20 ? 'network_wifi_1_bar' : 'signal_wifi_0_bar';

        return <label class='symbols' label={icon} />;
      }}
    </With>
  );
};

const NetworkIcon = ({ network }: { network: AstalNetwork.Network }) => {
  const primary = createBinding(network, 'primary');

  return (
    <With value={primary}>
      {(primary) =>
        primary === AstalNetwork.Primary.WIRED
          ? <WiredIcon wired={network.wired} />
          : <WifiIcon wifi={network.wifi} />
      }
    </With>
  );
}

export default () => {
  const network = AstalNetwork.get_default();

  return (
    <box
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.HORIZONTAL}
    >
      <NetworkIcon network={network} />
    </box>
  );
}
