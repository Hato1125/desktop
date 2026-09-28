import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';
import Pango from 'gi://Pango?version=1.0';
import AstalBluetooth from 'gi://AstalBluetooth?version=0.1';
import { type Accessor, For, createBinding, createMemo } from 'ags';
import { timeout } from 'ags/time';
import { defineComponent } from './component';
import Category from './category';
import Menu from './menu';

const bt = AstalBluetooth.get_default();
const powered = createBinding(bt, 'isPowered');
const devices = createBinding(bt, 'devices');

const sortedDevices = createMemo(() =>
  devices()
    .map(device => ({
      device,
      named: !!createBinding(device, 'name')(),
      alias: createBinding(device, 'alias')() ?? '',
    }))
    .sort((a, b) =>
      Number(b.named) - Number(a.named) || a.alias.localeCompare(b.alias))
    .map(({ device }) => device)
);

const deviceIcon = (icon: string) => {
  switch (icon) {
    case 'computer': return 'computer';
    case 'phone': return 'smartphone';
    case 'modem': return 'router';
    case 'network-wireless': return 'wifi';
    case 'audio-headset': return 'headset_mic';
    case 'audio-headphones': return 'headphones';
    case 'audio-card': return 'speaker';
    case 'camera-video': return 'videocam';
    case 'camera-photo': return 'photo_camera';
    case 'input-gaming': return 'sports_esports';
    case 'input-keyboard': return 'keyboard';
    case 'input-tablet': return 'tablet';
    case 'input-mouse': return 'mouse';
    case 'printer': return 'print';
    default: return 'bluetooth';
  }
};

const toggleConnection = (device: AstalBluetooth.Device) => {
  if (device.connected) {
    device.disconnect_device((_source, res) => {
      try {
        device.disconnect_device_finish(res);
      } catch (error) {
        console.error(`disconnect ${device.alias}:`, error);
      }
    });
  } else {
    device.connect_device((_source, res) => {
      try {
        device.connect_device_finish(res);
      } catch (error) {
        console.error(`connect ${device.alias}:`, error);
      }
    });
  }
};

const scanDuration = 10_000;

const rescan = () => {
  const adapter = bt.adapter;
  if (!adapter || adapter.discovering) return;

  try {
    adapter.start_discovery();
  } catch (error) {
    console.error('start discovery:', error);
    return;
  }

  timeout(scanDuration, () => {
    try {
      adapter.stop_discovery();
    } catch (error) {
      console.error('stop discovery:', error);
    }
  });
};

const DeviceList =(
  { connected, minHeight }: { connected: boolean, minHeight?: number }
) => {
  const empty = createMemo(() =>
    !powered()
    || !devices().some(d => createBinding(d, 'connected')() === connected)
  );

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      heightRequest={minHeight ?? -1}
    >
      <label
        visible={empty}
        vexpand
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        cssClasses={[
          'label',
          'text-base',
          'empty',
        ]}
        label='Device not found'
      />
      <box visible={empty.as(e => !e)} orientation={Gtk.Orientation.VERTICAL}>
        <For each={sortedDevices}>
          {(device: AstalBluetooth.Device) => (
            <button
              class='card'
              visible={createBinding(device, 'connected').as(c => c === connected)}
              onClicked={() => toggleConnection(device)}
            >
              <box spacing={16}>
                <label
                  valign={Gtk.Align.CENTER}
                  cssClasses={[
                    'symbols',
                    'symbols-xl',
                  ]}
                  label={createBinding(device, 'icon').as(deviceIcon)}
                />
                <box hexpand spacing={8}>
                  <label
                    ellipsize={Pango.EllipsizeMode.END}
                    cssClasses={[
                      'label',
                      'text-base',
                    ]}
                    label={createBinding(device, 'alias')}
                  />
                  <label
                    valign={Gtk.Align.CENTER}
                    cssClasses={[
                      'label',
                      'text-sm',
                      'address',
                    ]}
                    label={device.address}
                  />
                </box>
                <Adw.Spinner
                  valign={Gtk.Align.CENTER}
                  widthRequest={10}
                  heightRequest={10}
                  visible={createBinding(device, 'connecting')}
                />
              </box>
            </button>
          )}
        </For>
      </box>
    </box>
  );
};

export default () => defineComponent('bluetooth', () => {
  const discovering = createBinding(bt, 'adapter', 'discovering');
  const icon = powered.as(p => p ? 'bluetooth' : 'bluetooth_disabled');

  return (
    <Menu
      classname='bluetooth'
      width={400}
      trigger={
        <label
          cssClasses={[
            'filled',
            'symbols',
            'symbols-xl',
          ]}
          label={icon}
        />
      }
    >
      {() => [
        <Category
          name='CONNECTED'
          header={(
            <box spacing={4}>
              <button
                sensitive={createMemo(() => powered() && !discovering())}
                onClicked={rescan}
              >
                <label
                  cssClasses={[
                    'filled',
                    'symbols',
                    'symbols-xl',
                  ]}
                  label='autorenew'
                />
              </button>
              <switch
                valign={Gtk.Align.CENTER}
                active={powered}
                onNotifyActive={(self) => {
                  if (bt.adapter) {
                    bt.adapter.powered = self.active;
                  }
                }}
              />
            </box>
          )}
        >
          <DeviceList connected />
        </Category>,

        <Category
          name='DEVICES'
          class='divided'
        >
          <DeviceList connected={false} minHeight={200} />
        </Category>
      ]}
    </Menu>
  );
})
