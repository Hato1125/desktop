import GObject from 'gi://GObject?version=2.0';

import { readFile, writeFile } from 'ags/file';
import {
  register,
  property,
} from 'ags/gobject';
import GLib from 'gi://GLib?version=2.0';

@register()
export class ConfigService extends GObject.Object {
  static instance: ConfigService;

  static get_default(): ConfigService{
    if (!this.instance) {
      this.instance = new ConfigService();
    }
    return this.instance;
  }

  constructor()  {
    super();
    this.load();
    this.connect('notify', () => this.save());
  }

  private load() {
    try {
      const str = readFile(`${GLib.get_user_config_dir()}/desktop/config.json`);
      const json = JSON.parse(str);
    } catch (e) {
      console.error(e);
    }
  }

  private save() {
    try {
      const str = JSON.stringify({
      });

      writeFile(`${GLib.get_user_config_dir()}/desktop/config.json`, str);
    } catch (e) {
      console.error(e);
    }
  }
}
