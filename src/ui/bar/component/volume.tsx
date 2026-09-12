import Gtk from 'gi://Gtk?version=4.0';
import AstalWp from 'gi://AstalWp?version=0.1';
import Pango from 'gi://Pango?version=1.0';
import { type Accessor, For, With, createBinding, createMemo } from 'ags';
import { defineComponent } from './component';
import Category from './category';
import Menu from './menu';

const wp = AstalWp.get_default()!;
const { audio } = wp;

const defaultSpeaker = createBinding(wp, 'defaultSpeaker');
const speakers = createBinding(audio, 'speakers').as(s => s ?? []);
const streams = createBinding(audio, 'streams').as(s => s ?? []);
const speakerMute = createBinding(wp, 'defaultSpeaker', 'mute');
const speakerVolume = createBinding(wp, 'defaultSpeaker', 'volume');

const unknownStreamName = 'Unknown';
const defaultStreamName = 'Speaker';

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

const Controller = (
  { node, title, sink }: {
    node: AstalWp.Node,
    title: Accessor<string> | string,
    sink: JSX.Element,
}) => {
  const mute = createBinding(node, 'mute');
  const volume = createBinding(node, 'volume');

  return (
    <box spacing={8} orientation={Gtk.Orientation.VERTICAL}>
      <box spacing={32}>
        <button onClicked={() => {node.mute = !node.mute }}>
          <box spacing={8}>
            <label
              cssClasses={[
                'filled',
                'symbols',
                'symbols-xl',
              ]}
              label={createMemo(() => volumeIcon(mute(), volume()))}
            />
            <label
              hexpand
              halign={Gtk.Align.START}
              ellipsize={Pango.EllipsizeMode.END}
              cssClasses={[
                'text',
                'text-base',
              ]}
              label={title}
            />
          </box>
        </button>
        {sink}
      </box>
      <slider
        hexpand
        valign={Gtk.Align.CENTER}
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChangeValue={(_0, _1, value) => {
          node.volume = Math.min(Math.max(value, 0), 1);
          return false;
        }}
      />
    </box>
  );
};

const sinkName = (endpoint: AstalWp.Endpoint) =>
  endpoint.get_pw_property('node.nick') ?? endpoint.description ?? '';

const SinkPicker = ({ active, isSelected, onSelect }: {
  active: Accessor<AstalWp.Endpoint | null>,
  isSelected: (endpoint: AstalWp.Endpoint) => Accessor<boolean>,
  onSelect: (endpoint: AstalWp.Endpoint) => void,
}) => {
  let popover: Gtk.Popover;

  const select = (endpoint: AstalWp.Endpoint) => {
    onSelect(endpoint);
    popover.popdown();
  };

  return (
    <menubutton class='sink'>
      <box spacing={8} orientation={Gtk.Orientation.HORIZONTAL}>
        <label
          cssClasses={[
            'filled',
            'symbols',
            'symbols-xl',
          ]}
          label='keyboard_arrow_down'
        />
        <With value={active}>
          {(endpoint: AstalWp.Endpoint | null) => endpoint && (
            <label
              ellipsize={Pango.EllipsizeMode.END}
              cssClasses={[
                'text',
                'text-sm',
              ]}
              label={sinkName(endpoint)}
            />
          )}
        </With>
      </box>

      <popover $={(self) => { popover = self; }} hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={speakers}>
            {(endpoint: AstalWp.Endpoint) => (
              <button
                class={isSelected(endpoint).as(s => s ? 'checked' : '')}
                onClicked={() => select(endpoint)}
              >
                <label
                  halign={Gtk.Align.START}
                  cssClasses={[
                    'text',
                    'text-base',
                  ]}
                  label={sinkName(endpoint)}
                />
              </button>
            )}
          </For>
        </box>
      </popover>
    </menubutton>
  );
};

const StreamSink = ({ stream }: { stream: AstalWp.Stream }) => {
  const targetEndpoint = createBinding(stream, 'targetEndpoint');

  return (
    <SinkPicker
      active={createMemo(() => targetEndpoint() ?? defaultSpeaker())}
      isSelected={(endpoint) => {
        const isDefault = createBinding(endpoint, 'isDefault');

        return createMemo(() => {
          const target = targetEndpoint();
          return target ? target.id === endpoint.id : isDefault();
        });
      }}
      onSelect={(endpoint) => { stream.targetEndpoint = endpoint; }}
    />
  );
};

const DefaultSink = () => (
  <SinkPicker
    active={defaultSpeaker}
    isSelected={(endpoint) => createBinding(endpoint, 'isDefault')}
    onSelect={(endpoint) => endpoint.set_is_default(true)}
  />
);

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
      <Category name='MASTER'>
        <With value={defaultSpeaker}>
          {speaker => speaker && (
            <Controller
              node={speaker}
              title={defaultStreamName}
              sink={<DefaultSink />}
            />
          )}
        </With>
      </Category>,

      <Category
        name='APPLICATIONS'
        class='divided'
        visible={streams.as(s => s.length > 0)}
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
          <For each={streams}>
            {stream => (
              <Controller
                node={stream}
                title={
                  createBinding(stream, 'description')
                    .as(d => d
                      ?? stream.name
                      ?? unknownStreamName
                    )
                }
                sink={<StreamSink stream={stream} />}
              />
            )}
          </For>
        </box>
      </Category>
    ]}
  </Menu>
));
