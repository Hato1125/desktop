import NM from 'gi://NM';
import GObject from 'gi://GObject?version=2.0';
import AstalNetwork from 'gi://AstalNetwork?version=0.1';

import {
  register,
  property,
} from 'ags/gobject';
import fetch from 'gnim/fetch';

import { support, makeService } from 'src/feature/feature';

@support({
  os: [{ os: 'linux' }]
})
@register()
class VpnService extends GObject.Object {
  @property(Boolean) connected: boolean = false;
  @property(String) country: string = '';

  private currentVpn: NM.ActiveConnection | null = null;

  constructor() {
    super();

    const client = AstalNetwork.get_default().client;

    client.connect('notify::active-connections', () => {
      this.update(client);
    });

    this.update(client);
  }

  private async update(client: NM.Client) {
    try {
      const connections = client.get_active_connections();
      const vpnConn = connections.find(
        c => c.type === 'wireguard' && c.state === NM.ActiveConnectionState.ACTIVATED
      ) ?? null;

      if (vpnConn === this.currentVpn) return;
      this.currentVpn = vpnConn;

      if (!vpnConn) {
        if (this.connected) this.connected = false;
        if (this.country) this.country = '';
        return;
      }

      const res = await fetch('http://ip-api.com/line/?fields=countryCode');
      this.country = (await res.text()).trim();
      this.connected = true;
    } catch (e) {
      console.error('Vpn:', e);
    }
  }
}

export default makeService(VpnService);
