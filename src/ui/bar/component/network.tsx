import AstalNetwork from 'gi://AstalNetwork?version=0.1';
import { createBinding, With } from 'ags';

export default () => {
  const network = AstalNetwork.get_default();
  const primary = createBinding(network, 'primary');

  return (
    <box>
      <With value={primary}>
        {(primary) => {
          switch (primary) {
            case AstalNetwork.Primary.WIRED:
              return (
                <label
                  cssClasses={['symbols', 'symbol-s2']}
                  label={
                    network.wired.state === AstalNetwork.DeviceState.ACTIVATED
                      ? 'automation'
                      : 'signal_disconnected'
                  }
                />
              );
            case AstalNetwork.Primary.WIFI:
              return (
                <label
                  cssClasses={['symbols', 'symbol-s3']}
                  label={
                    network.wifi.state !== AstalNetwork.DeviceState.ACTIVATED
                      ? 'wifi_off'
                      : network.wifi.strength >= 67 ? 'wifi' :
                        network.wifi.strength >= 34 ? 'wifi_2_bar' : 'wifi_1_bar'
                  }
                />
              );
            case AstalNetwork.Primary.UNKNOWN:
              return <label class='symbols' label='android_wifi_3_bar_off' />
          }
        }}
      </With>
    </box>
  );
}
