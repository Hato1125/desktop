import Gtk from 'gi://Gtk?version=4.0';
import AstalHyprland from 'gi://AstalHyprland?version=0.1';
import { createBinding, For } from 'ags';
import { defineComponent } from './component';

export default () => {
  const hyprland = AstalHyprland.get_default();
  const workspaces = createBinding(hyprland, 'workspaces');
  const focused = createBinding(hyprland, 'focusedWorkspace');

  return defineComponent('workspaces', () => (
    <box class='workspaces' spacing={8}>
      <For each={workspaces}>
        {(workspace: AstalHyprland.Workspace) => (
          <button
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            cssClasses={focused.as(f =>
              workspace.id === f.id
                ? ['workspace', 'focused']
                : ['workspace', 'unfocused']
            )}
            onClicked={() => {
              workspace.focus();
            }}
          >
            <label
              cssClasses={[
                'text-sm',
              ]}
              label={workspace.id.toString()}
            />
          </button>
        )}
      </For>
    </box>
  ));
}
