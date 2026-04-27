import GLib from 'gi://GLib?version=2.0';

import type {
  Os,
  Compositor,
  Version,
  Env,
} from './feature';

function execSync(cmd: string): string | null {
  try {
    const [ok, stdout] = GLib.spawn_command_line_sync(cmd);
    if (!ok || !stdout) return null;
    return new TextDecoder().decode(stdout).trim();
  } catch {
    return null;
  }
}

function parseVersion(s: string | null | undefined): Version {
  if (!s) return [0, 0];
  const m = s.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!m) return [0, 0];
  const a = parseInt(m[1]!, 10);
  const b = parseInt(m[2]!, 10);
  if (m[3] !== undefined) return [a, b, parseInt(m[3], 10)];
  return [a, b];
}

function detectOs(): Os | null {
  const sysname = (execSync('uname -s') ?? '').toLowerCase();
  switch (sysname) {
    case 'linux':   return 'linux';
    case 'freebsd': return 'freebsd';
    case 'openbsd': return 'openbsd';
    case 'netbsd':  return 'netbsd';
    default:        return null;
  }
}

function detectCompositor(): Compositor | null {
  const desktop = (GLib.getenv('XDG_CURRENT_DESKTOP') ?? '').toLowerCase();
  if (desktop.includes('hyprland')) return 'hyprland';
  if (desktop.includes('niri'))     return 'niri';
  if (desktop.includes('sway'))     return 'sway';

  if (GLib.getenv('HYPRLAND_INSTANCE_SIGNATURE')) return 'hyprland';
  if (GLib.getenv('NIRI_SOCKET'))                 return 'niri';
  if (GLib.getenv('SWAYSOCK'))                    return 'sway';

  return null;
}

function detectCompositorVersion(c: Compositor): Version {
  switch (c) {
    case 'hyprland': {
      const out = execSync('hyprctl version') ?? '';
      const m = out.match(/Tag:\s*v?(\d+\.\d+(?:\.\d+)?)/);
      return parseVersion(m?.[1]);
    }
    case 'niri': {
      const out = execSync('niri --version') ?? '';
      const m = out.match(/(\d+\.\d+(?:\.\d+)?)/);
      return parseVersion(m?.[1]);
    }
    case 'sway': {
      const out = execSync('swaymsg -t get_version --raw') ?? '';
      try {
        const v = JSON.parse(out) as { major?: number, minor?: number, patch?: number };
        return [v.major ?? 0, v.minor ?? 0, v.patch ?? 0];
      } catch {
        return [0, 0];
      }
    }
  }
}

export function detectEnv(): Env {
  const os = detectOs();
  if (!os) throw new Error('feature: cannot detect OS (uname -s returned unsupported value)');

  const compositor = detectCompositor();
  if (!compositor) throw new Error('feature: cannot detect compositor (set XDG_CURRENT_DESKTOP or run under Hyprland/Niri/Sway)');

  return {
    os,
    osVersion: parseVersion(execSync('uname -r')),
    compositor,
    compositorVersion: detectCompositorVersion(compositor),
  };
}
