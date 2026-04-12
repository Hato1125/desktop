import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import GObject from 'gi://GObject?version=2.0';
import AstalHyprland from 'gi://AstalHyprland?version=0.1';

import {
  register,
  property,
} from 'ags/gobject';

export class Game {
  constructor(
    public pid: number = 0,
    public name: string = '',
  ) {}
}

const BUS_NAME = 'com.feralinteractive.GameMode';
const BUS_PATH = '/com/feralinteractive/GameMode';
const BUS_IFACE = 'com.feralinteractive.GameMode';

const hyprland = AstalHyprland.get_default();

const getGameName = (pid: number): string =>
  hyprland.get_clients().find(c => c.get_pid() === pid)
    ?.get_initial_class()
    ?.split('.')
    .pop()
    ?.replace(/^./, c => c.toUpperCase()) ?? '';

@register()
export class GameModeService extends GObject.Object {
  @property(Array) games: Game[] = [];

  onRegistered: ((game: Game) => void) | null = null;
  onUnregistered: ((game: Game) => void) | null = null;

  private _proxy: Gio.DBusProxy;

  constructor() {
    super();

    this._proxy = Gio.DBusProxy.new_for_bus_sync(
      Gio.BusType.SESSION,
      Gio.DBusProxyFlags.NONE,
      null,
      BUS_NAME,
      BUS_PATH,
      BUS_IFACE,
      null,
    );

    this._proxy.connect('g-signal', (_proxy, _sender, signal, params) => {
      if (signal === 'GameRegistered') {
        const [pid] = (params as GLib.Variant).deepUnpack() as [number, number];
        let attempts = 0;
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
          attempts++;
          const name = getGameName(pid);
          if (name) {
            const game = new Game(pid, name);
            this.refresh();
            this.onRegistered?.(game);
            return GLib.SOURCE_REMOVE;
          }

          return attempts < 10
            ? GLib.SOURCE_CONTINUE
            : GLib.SOURCE_REMOVE;
        });
      } else if (signal === 'GameUnregistered') {
        const [pid] = (params as GLib.Variant).deepUnpack() as [number, number];
        const game = this.games.find(g => g.pid === pid);
        if (!game) return;
        this.refresh();
        this.onUnregistered?.(game);
      }
    });

    this.refresh();
  }

  private refresh() {
    try {
      const result = this._proxy.call_sync(
        'ListGames',
        null,
        Gio.DBusCallFlags.NONE,
        -1,
        null,
      );

      const entries = (result!.deepUnpack() as [number, number][][])[0]!;
      this.games = entries
        .map(([pid]) => new Game(pid, getGameName(pid)))
        .filter(g => g.name !== '');
    } catch (e) {
      console.error('GameMode:', e);
      this.games = [];
    }
  }
}

export default new GameModeService();
