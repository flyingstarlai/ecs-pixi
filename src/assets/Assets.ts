/**
 * Central registry for every PNG (or SVG/JPEG…) in /public/assets.
 */
import { Assets, Texture } from "pixi.js";

/* ---------- 1  Bundle definitions (add new aliases here) --------- */

export const spriteBundles = {
  ui: {
    commandLeft: "/assets/ui/Puzzle_Left.png",
    commandRight: "/assets/ui/Puzzle_Right.png",
    commandUp: "/assets/ui/Puzzle_Up.png",
    commandDown: "/assets/ui/Puzzle_Down.png",
    commandEvent: "/assets/ui/command-event.png",
    controlPlay: "/assets/ui/control-play.png",
    controlStop: "/assets/ui/control-stop.png",
  },
  hero: {
    atlas: "/assets/hero/Knight_Atlas.json",
  },
  enemy: {
    monster: "/assets/monster.png",
  },
  environment: {
    background: "/assets/background.png",
  },
  item: {
    donut: "/assets/donut.png",
    donutEmpty: "/assets/donut_empty.png",
    star: "/assets/star.png",
    flag: "/assets/flag.png",
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
 * const play = ui.controlPlay;   // Texture, auto-typed ✓
 * ```
 */
export async function loadBundle<B extends BundleName>(
  name: B,
): Promise<BundleTextures<B>> {
  return (await Assets.loadBundle(name)) as Promise<BundleTextures<B>>;
}
