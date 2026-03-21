import AstalNetwork from 'gi://AstalNetwork?version=0.1';

import NM from 'gi://NM';
import GObject, { register, property } from "ags/gobject"
import fetch from 'gnim/fetch';

@register()
export class VpnService extends GObject.Object {
  @property(Boolean) connected: boolean = false;
  @property(String) country: string = '';

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
      );
      const isConnected = !!vpnConn;

      if (!isConnected) {
        this.connected = false;
        this.country = '';
      } else if (!this.connected) {
        const res = await fetch('http://ip-api.com/line/?fields=countryCode')
        this.country = (await res.text()).trim();
        this.connected = true;
      }
    } catch (e) {
      console.error(e);
    }
  }
}
