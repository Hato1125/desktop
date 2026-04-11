import AstalHyprland from 'gi://AstalHyprland?version=0.1';
import Pango from 'gi://Pango?version=1.0';

import { createBinding, With } from 'ags';

const nestedCompositors = [
  'gamescope',
  'cage',
  'Xephyr',
];

const displayClientName = (client: AstalHyprland.Client) => {
  const initialClass = client.get_initial_class();

  if (!initialClass
    || initialClass.trim() === ''
    || nestedCompositors.includes(initialClass)) {
    return client.get_title();
  }

  return initialClass
    .split('.')
    .pop()
    ?.replace(/^./, c => c.toUpperCase());
}

export default () => {
  const focused = createBinding(AstalHyprland.get_default(), 'focusedClient');

  return (
    <box class='client'>
      <With value={focused}>
        {(client) => client && (
          <label
            cssClasses={[
              'label',
              'text-base'
            ]}
            label={displayClientName(client)}
            maxWidthChars={65}
            ellipsize={Pango.EllipsizeMode.END}
          />
        )}
      </With>
    </box>
  );
}
