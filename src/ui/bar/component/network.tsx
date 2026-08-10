import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';
import Pango from 'gi://Pango?version=1.0';
import AstalNetwork from 'gi://AstalNetwork?version=0.1';
import { type Accessor, createBinding, createMemo, For, With } from 'ags';
import { defineComponent } from './component';
import Category from './category';
import Popup from './popup';

const network = AstalNetwork.get_default();
const primary = createBinding(network, 'primary');

const wired = network.wired as AstalNetwork.Wired | null;
const wifi = network.wifi as AstalNetwork.Wifi | null;

const bandLabel = (frequency: number) =>
  frequency >= 5900 ? '6G'
    : frequency >= 4000 ? '5G'
      : '2.4G';

const wifiIcon = (strength: number) =>
  strength >= 67 ? 'wifi'
    : strength >= 34 ? 'wifi_2_bar'
      : 'wifi_1_bar';

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
      : wifiIcon(strength())
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

const AccessPointRow = (
  { ap, class: cssClass }: {
    ap: AstalNetwork.AccessPoint,
    class: Accessor<string>,
  }
) => (
  <button
    class={cssClass}
    onClicked={() => {
      // Not promisified, so the finish call is where failures surface.
      ap.activate(null, (_source, res) => {
        try {
          ap.activate_finish(res);
        } catch (error) {
          console.error(`activate ${ap.ssid}:`, error);
        }
      });
    }}
  >
    <box spacing={8}>
      <box valign={Gtk.Align.CENTER}>
        <label
          cssClasses={[
            'symbols',
            'symbols-xl',
          ]}
          label={createBinding(ap, 'strength').as(wifiIcon)}
        />
        <label
          valign={Gtk.Align.START}
          visible={ap.requiresPassword}
          cssClasses={[
            'symbols',
            'symbols-xs',
            'secured',
          ]}
          label='lock'
        />
      </box>
      <label
        hexpand
        halign={Gtk.Align.START}
        maxWidthChars={24}
        ellipsize={Pango.EllipsizeMode.END}
        cssClasses={[
          'label',
          'text-base',
        ]}
        label={ap.ssid}
      />
      <label
        valign={Gtk.Align.CENTER}
        cssClasses={[
          'label',
          'text-sm',
          'band',
        ]}
        label={bandLabel(ap.frequency)}
      />
    </box>
  </button>
);

const AccessPoints = ({ wifi }: { wifi: AstalNetwork.Wifi }) => {
  const active = createBinding(wifi, 'activeAccessPoint');

  // Several BSSIDs can share one SSID; keep the strongest of each.
  const points = createBinding(wifi, 'accessPoints').as((aps) => {
    const strongest = new Map<string, AstalNetwork.AccessPoint>();

    for (const ap of aps) {
      if (!ap.ssid) continue;

      const current = strongest.get(ap.ssid);
      if (!current || ap.strength > current.strength) {
        strongest.set(ap.ssid, ap);
      }
    }

    return [...strongest.values()].sort((a, b) => b.strength - a.strength);
  });

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <For each={points}>
        {(ap: AstalNetwork.AccessPoint) => (
          <AccessPointRow
            ap={ap}
            class={active.as(a => a?.ssid === ap.ssid ? 'checked' : '')}
          />
        )}
      </For>
    </box>
  );
};

const WifiStatus = ({ wifi }: { wifi: AstalNetwork.Wifi }) => (
  <label
    halign={Gtk.Align.START}
    cssClasses={[
      'label',
      'text-base',
    ]}
    label={createBinding(wifi, 'ssid').as(s => s || 'Not connected')}
  />
);

const WifiHeader = ({ wifi }: { wifi: AstalNetwork.Wifi }) => {
  const enabled = createBinding(wifi, 'enabled');
  const scanning = createBinding(wifi, 'scanning');

  return (
    <box spacing={8}>
      <button
        class='scan'
        valign={Gtk.Align.CENTER}
        sensitive={createMemo(() => enabled() && !scanning())}
        onClicked={() => wifi.scan()}
      >
        <box>
          <Adw.Spinner
            visible={scanning}
            widthRequest={13}
            heightRequest={13}
          />
          <label
            visible={scanning.as(s => !s)}
            cssClasses={[
              'symbols',
              'symbols-lg',
            ]}
            label='refresh'
          />
        </box>
      </button>
      <switch
        valign={Gtk.Align.CENTER}
        active={enabled}
        onNotifyActive={(self) => { wifi.enabled = self.active; }}
      />
    </box>
  );
};

const WifiSections = ({ wifi }: { wifi: AstalNetwork.Wifi }) => {
  const enabled = createBinding(wifi, 'enabled');

  const show = primary.as(p => p !== AstalNetwork.Primary.WIRED);

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      <Category
        name='Wi-Fi'
        visible={show}
        header={<WifiHeader wifi={wifi} />}
      >
        <WifiStatus wifi={wifi} />
      </Category>

      <Category
        name='Networks'
        visible={createMemo(() => show() && enabled())}
      >
        <AccessPoints wifi={wifi} />
      </Category>
    </box>
  );
};

export default () => defineComponent('network', () => {
  const trigger = (
    <With value={primary}>
      {(p) => {
        switch (p) {
          case AstalNetwork.Primary.WIRED: return <Wired wired={wired} />
          case AstalNetwork.Primary.WIFI: return <WiFi wifi={wifi} />
          case AstalNetwork.Primary.UNKNOWN: return <Unknown />
        }
      }}
    </With>
  );

  return wifi
    ? (
      <Popup width={400} trigger={trigger}>
        <WifiSections wifi={wifi} />
      </Popup>
    )
    : <box>{trigger}</box>;
});
