/**
 * Central registry for every PNG (or SVG/JPEG…) in /public/assets.
 */
import { Assets, Texture } from "pixi.js";

/* ---------- 1  Bundle definitions (add new aliases here) --------- */

export const spriteBundles = {
  ui: {
    bunny: "/assets/bunny.png",
    commandUp: "/assets/ui/command-up.png",
    commandEvent: "/assets/ui/command-event.png",
    controlPlay: "/assets/ui/control-play.png",
    controlStop: "/assets/ui/control-stop.png",
    energy: "/assets/energy.png",
    monster: "/assets/monster.png",
    background: "/assets/background.png",
  },
  hero: {
    heroEss: "/assets/hero/hero-ess.png",
  },
} as const;

/* ---------- 2  Narrow, type-safe texture maps -------------------- */

export type BundleName = keyof typeof spriteBundles; // 'ui' | 'hero'

export type BundleTextures<B extends BundleName> = {
  readonly [K in keyof (typeof spriteBundles)[B]]: Texture;
};

/* ---------- 3  Registration + loading helpers ------------------- */

/** Call once, e.g. from RenderSystem.prepare() */
export function registerSpriteBundles(): void {
  for (const [name, map] of Object.entries(spriteBundles)) {
    Assets.addBundle(name, map);
  }
}

/**
 * Load a bundle and get a strongly-typed texture map back.
 *
 * ```ts
 * const ui = await loadBundle('ui');
 * const bunny = ui.bunny;   // Texture, auto-typed ✓
 * ```
 */
export async function loadBundle<B extends BundleName>(
  name: B,
): Promise<BundleTextures<B>> {
  return (await Assets.loadBundle(name)) as Promise<BundleTextures<B>>;
}
