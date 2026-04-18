import Gtk from 'gi://Gtk?version=4.0';
import { toggleWindow } from '@ui/launcher/index';

export default () => (
  <button
    onClicked={() => {
      toggleWindow();
    }}
  >
    <label
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      cssClasses={[
        'search',
        'symbols',
        'text-lg'
      ]}
      label='search'
    />
  </button>
);
