import AstalHyprland from 'gi://AstalHyprland?version=0.1';
import Pango from 'gi://Pango?version=1.0';

import { createBinding, With } from 'ags';

const nestedCompositors = [
  'gamescope',
  'cage',
  'Xephyr',
];

const displayClientName = (client: AstalHyprland.Client) => {
  if (nestedCompositors.includes(client.get_initial_class())) {
    return client.get_title();
  }

  return client.get_initial_class()
    .split('.')
    .pop()
    ?.replace(/^./, c => c.toUpperCase());
}

export default () => {
  const focused = createBinding(AstalHyprland.get_default(), 'focusedClient');

  return (
    <With value={focused}>
      {(client) => client && (
        <label
          label={displayClientName(client)}
          singleLineMode={true}
          maxWidthChars={65}
          ellipsize={Pango.EllipsizeMode.END}
        />
      )}
    </With>
  );
}
