import { detectEnv } from './env';

export type Os = 'linux'
  | 'freebsd'
  | 'openbsd'
  | 'netbsd';

export type Compositor = 'hyprland'
  | 'niri'
  | 'sway';

export type Version = readonly [number, number]
  | readonly [number, number, number];

export interface OsSupport {
  os: Os,
  min?: Version,
  max?: Version,
}

export interface CompositorSupport {
  compositor: Compositor,
  min?: Version,
  max?: Version,
}

export interface Env {
  os: Os,
  osVersion: Version,
  compositor: Compositor,
  compositorVersion: Version,
}

export class FeatureSupport {
  readonly os?: OsSupport[];
  readonly compositor?: CompositorSupport[];

  constructor(
    { os, compositor, }: {
      os?: OsSupport[],
      compositor?: CompositorSupport[]
    }
  ) {
    this.os = os;
    this.compositor = compositor;
  }

  isAvailable(env: Env): boolean {
    if (this.os && !this.os.some(s =>
      s.os === env.os && this.inRange(
        env.osVersion,
        s.min,
        s.max
      )
    )) return false;

    if (this.compositor && !this.compositor.some(s =>
      s.compositor === env.compositor && this.inRange(
        env.compositorVersion,
        s.min,
        s.max
      )
    )) return false;

    return true;
  }

  private compareVersion(a: Version, b: Version): number {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const d = (a[i] ?? 0) - (b[i] ?? 0);
      if (d !== 0) return d;
    }
    return 0;
  }

  private inRange(v: Version, min?: Version, max?: Version): boolean {
    if (min && this.compareVersion(v, min) < 0) return false;
    if (max && this.compareVersion(v, max) >= 0) return false;
    return true;
  }
}

export type FeatureSupportInit = ConstructorParameters<typeof FeatureSupport>[0];

interface RegistryEntry {
  name: string;
  support: FeatureSupport;
}

const registry: RegistryEntry[] = [];

let _env: Env | null = null;
export const env = (): Env => _env ??= detectEnv();

export function support(init: FeatureSupportInit = {}) {
  return function <T extends new (...args: any[]) => any>(
    target: T,
    _ctx: ClassDecoratorContext<T>,
  ): void {
    const sup = new FeatureSupport(init);
    (target as unknown as { support: FeatureSupport }).support = sup;
    registry.push({ name: target.name, support: sup });
  };
}

export function makeService<T>(cls: { new(): T; readonly support?: FeatureSupport }): T | null {
  if (cls.support && !cls.support.isAvailable(env())) return null;
  return new cls();
}

export function defineFeature(
  name: string,
  init: FeatureSupportInit,
  fn: () => void,
): void {
  const sup = new FeatureSupport(init);
  registry.push({ name, support: sup });
  if (sup.isAvailable(env())) fn();
}

export interface FeatureCheckResult {
  name: string;
  available: boolean;
  support: FeatureSupport;
}

export function checkAllFeatures(env: Env): FeatureCheckResult[] {
  return registry.map(c => ({
    name: c.name,
    support: c.support,
    available: c.support.isAvailable(env),
  }));
}
