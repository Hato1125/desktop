import AstalHyprland from 'gi://AstalHyprland?version=0.1';
import Pango from 'gi://Pango?version=1.0';
import { createBinding, With } from 'ags';
import { defineComponent } from './component';

const nestedCompositors = [
  'gamescope',
  'cage',
  'Xephyr',
];

const displayClientName = (initialClass: string, title: string) => {
  if (!initialClass
    || initialClass.trim() === ''
    || nestedCompositors.includes(initialClass)) {
    return title;
  }

  return initialClass
    .split('.')
    .pop()
    ?.replace(/^./, c => c.toUpperCase()) ?? '';
}

export default () => {
  const focused = createBinding(AstalHyprland.get_default(), 'focusedClient');

  return defineComponent('client', () => (
    <box class='client'>
      <With value={focused}>
        {(client) => client && (
          <label
            cssClasses={[
              'label',
              'text-base'
            ]}
            label={createBinding(client, 'title').as(t =>
              displayClientName(client.get_initial_class(), t)
            )}
            maxWidthChars={65}
            ellipsize={Pango.EllipsizeMode.END}
          />
        )}
      </With>
    </box>
  ));
}
