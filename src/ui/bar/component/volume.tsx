import Gtk from 'gi://Gtk?version=4.0';
import AstalWp from 'gi://AstalWp?version=0.1';
import { createBinding, createEffect, createMemo, For, With } from 'ags';
import { defineComponent } from './component';
import Category from './category';
import Menu from './menu';

const wp = AstalWp.get_default()!;
const { audio } = wp;

const defaultSpeaker = createBinding(wp, 'defaultSpeaker');
const speakers = createBinding(audio, 'speakers');
const streams = createBinding(audio, 'streams');

const speakerMute = createBinding(wp, 'defaultSpeaker', 'mute');
const speakerVolume = createBinding(wp, 'defaultSpeaker', 'volume');

const volumeIcon = (mute: boolean, volume: number) => {
  if (mute) return 'volume_off';
  if (volume <= 0) return 'volume_mute';
  if (volume <= 0.5) return 'volume_down';
  return 'volume_up';
};

const icon = createMemo(() => defaultSpeaker()
  ? volumeIcon(speakerMute(), speakerVolume())
  : 'volume_off'
);

// Endpoint and Stream both derive from Node, so the same row drives either.
const VolumeRow = ({ node }: { node: AstalWp.Node }) => {
  const mute = createBinding(node, 'mute');
  const volume = createBinding(node, 'volume');

  return (
    <box spacing={8}>
      <button
        valign={Gtk.Align.CENTER}
        onClicked={() => { node.mute = !node.mute; }}
      >
        <label
          cssClasses={[
            'filled',
            'symbols',
            'symbols-xl',
          ]}
          label={createMemo(() => volumeIcon(mute(), volume()))}
        />
      </button>

      <slider
        hexpand
        valign={Gtk.Align.CENTER}
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChangeValue={(_self, _scroll, value) => {
          node.volume = Math.min(Math.max(value, 0), 1);
          return false;
        }}
      />

      <label
        widthChars={5}
        halign={Gtk.Align.END}
        valign={Gtk.Align.CENTER}
        cssClasses={[
          'label',
          'text-base',
        ]}
        label={volume.as(v => `${Math.round(v * 100)}%`)}
      />
    </box>
  );
};

const StreamSink = ({ stream }: { stream: AstalWp.Stream }) => {
  const target = createBinding(stream, 'targetEndpoint');

  // A stream without an explicit target follows whatever the default speaker is.
  const active = createMemo(() => target()?.id ?? defaultSpeaker()?.id);

  const model = new Gtk.StringList();
  let endpoints: AstalWp.Endpoint[] = [];

  // Guards the notify::selected handler while the model is rebuilt from wireplumber.
  let syncing = false;

  const dropdown = (
    <Gtk.DropDown
      class='sink'
      hexpand
      model={model}
      valign={Gtk.Align.CENTER}
      onNotifySelected={(self) => {
        if (!syncing) {
          const endpoint = endpoints[self.selected];

          if (endpoint && endpoint.id !== target()?.id) {
            stream.targetEndpoint = endpoint;
          }
        }
      }}
    />
  ) as Gtk.DropDown;

  // Registered after the dropdown exists: effects run once on creation.
  createEffect(() => {
    const list = speakers();
    const id = active();

    syncing = true;
    endpoints = [...list];
    model.splice(0, model.get_n_items(), endpoints.map(e => e.description));
    dropdown.selected = Math.max(endpoints.findIndex(e => e.id === id), 0);
    syncing = false;
  });

  return dropdown;
};

const Stream = ({ stream }: { stream: AstalWp.Stream }) => (
  <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
    <label
      halign={Gtk.Align.START}
      cssClasses={[
        'label',
        'text-base',
      ]}
      label={createBinding(stream, 'description').as(d => d || stream.name)}
    />
    <VolumeRow node={stream} />
    <StreamSink stream={stream} />
  </box>
);

const Speaker = ({ endpoint }: { endpoint: AstalWp.Endpoint }) => {
  const isDefault = createBinding(endpoint, 'isDefault');

  return (
    <button
      class={isDefault.as(d => d ? 'checked' : '')}
      onClicked={() => endpoint.set_is_default(true)}
    >
      <box spacing={8}>
        <label
          cssClasses={[
            'symbols',
            'symbols-xl',
          ]}
          label={isDefault.as(d => d
            ? 'radio_button_checked'
            : 'radio_button_unchecked'
          )}
        />
        <label
          hexpand
          halign={Gtk.Align.START}
          cssClasses={[
            'label',
            'text-base',
          ]}
          label={endpoint.description}
        />
      </box>
    </button>
  );
};

export default () => defineComponent('volume', () => (
  <Menu
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
      <Category name='Volume'>
        <With value={defaultSpeaker}>
          {(speaker: AstalWp.Endpoint | null) => speaker
            ? <VolumeRow node={speaker} />
            : <box />}
        </With>
      </Category>,

      <Category
        name='Applications'
        visible={streams.as(s => s.length > 0)}
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
          <For each={streams}>
            {(stream: AstalWp.Stream) => <Stream stream={stream} />}
          </For>
        </box>
      </Category>,

      <Category name='Default Output'>
        <For each={speakers}>
          {(endpoint: AstalWp.Endpoint) => <Speaker endpoint={endpoint} />}
        </For>
      </Category>,
    ]}
  </Menu>
));
