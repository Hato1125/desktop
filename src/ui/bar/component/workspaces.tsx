import Gtk from 'gi://Gtk?version=4.0';
import AstalHyprland from 'gi://AstalHyprland?version=0.1';
import { createBinding, For } from 'ags';
import { defineComponent } from './component';

const FOCUSED_WORKSPACE = ['workspace', 'focused'];
const UNFOCUSED_WORKSPACE = ['workspace', 'unfocused'];

export default () => {
  const hyprland = AstalHyprland.get_default();
  const workspaces = createBinding(hyprland, 'workspaces')
    .as(ws => [...ws].sort((a, b) => a.id - b.id));
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
                ? FOCUSED_WORKSPACE
                : UNFOCUSED_WORKSPACE
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
