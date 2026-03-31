import Gtk from 'gi://Gtk?version=4.0'
import Gdk from 'gi://Gdk?version=4.0'
import Astal from 'gi://Astal?version=4.0'
import AstalApps from 'gi://AstalApps'

import { createState, For } from 'ags'

const apps = new AstalApps.Apps();

let window: Astal.Window;
let entry: Gtk.Entry;

const [list, setList] = createState(apps.get_list());

const launch = (app: AstalApps.Application) => {
  if (app.launch()) {
    closeWindow();
  }
}

const search = (text: string) => {
  setList(
    apps.fuzzy_query(text)
      .filter((app) => {
        return !app.categories.includes('X-WayDroid-App')
      })
  );
}

const SearchBox = () => (
  <box class='search' spacing={16}>
    <Gtk.GestureClick onPressed={() => entry.grab_focus()} />
    <label
      cssClasses={[
        'symbols',
        'symbol-m1',
      ]}
      label='search'
    />
    <entry
      $={(ref) => (entry = ref)}
      cssClasses={[
        'label-heading-s',
      ]}
      hexpand={true}
      placeholderText='Search'
      onNotifyText={({ text }) => search(text)}
    />
  </box>
);

const Item = ({ app }: { app: AstalApps.Application }) => (
  <button class='item' onClicked={() => launch(app)}>
    <box spacing={16}>
      <image
        cssClasses={['symbol-m1']}
        iconName={app.iconName}
      />
      <label
        cssClasses={['label-body-xl']}
        label={app.name}
      />
    </box>
  </button>
);

const List = () => (
  <scrolledwindow heightRequest={350} vexpand={true} hexpand={true}>
    <box orientation={Gtk.Orientation.VERTICAL}>
      <For each={list}>
        {(app) => (<Item app={app} />)}
      </For>
    </box>
  </scrolledwindow>
);

export const closeWindow = () => {
  window.visible = false;
}

export const toggleWindow = () => {
  window.visible = !window.visible;
}

const onKey = (_0: unknown, value: number, _1: unknown, _2: unknown) => {
  if (value === Gdk.KEY_Escape) {
    window.visible = false;
  } else  if (
    value !== Gdk.KEY_Return &&
    value !== Gdk.KEY_Up &&
    value !== Gdk.KEY_Down
  ) {
    entry.grab_focus();
    const unicode = Gdk.keyval_to_unicode(value);

    if (unicode && unicode >= 0x20 && unicode !== 0x7F) {
      const char = String.fromCodePoint(unicode);
      const newText = entry.get_text() + char;
      entry.set_text(newText);
      entry.set_position(newText.length);
    }
  }
}

const onPressed = (_1: unknown, _2: unknown, x: number, y: number) => {
  const alloc = content.get_allocation();

  if (x < alloc.x
    || x > alloc.x + alloc.width
    || y < alloc.y
    || y > alloc.y + alloc.height
  ) {
    closeWindow();
  }
}

let content: Gtk.Box;

export default () => (
  <window
    $={(ref) => (window = ref)}
    class='launcher'
    namespace='launcher'
    anchor={
      Astal.WindowAnchor.BOTTOM
      | Astal.WindowAnchor.TOP
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT
    }
    keymode={Astal.Keymode.EXCLUSIVE}
    exclusivity={Astal.Exclusivity.IGNORE}
    onNotifyVisible={({ visible }) => {
      if (visible) {
        entry.set_text('');
        entry.grab_focus();
      }
    }}
  >
    <Gtk.EventControllerKey onKeyPressed={onKey} />
    <Gtk.GestureClick onPressed={onPressed} />

    <box
      $={(ref) => (content = ref)}
      class='content'
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.VERTICAL}
    >
      <SearchBox />
      <List />
    </box>
  </window>
);
