import { System } from "../../core/System.ts";
import {
  BundleTextures,
  loadBundle,
  registerSpriteBundles,
} from "../../assets/Assets.ts";

type UiTex = BundleTextures<"ui">;
type HeroTex = BundleTextures<"hero">;
type EnemyTex = BundleTextures<"enemy">;
type EnvTex = BundleTextures<"environment">;
type ItemTex = BundleTextures<"item">;

export class AssetLoadSystem extends System {
  public ui!: UiTex;
  public hero!: HeroTex;
  public enemy!: EnemyTex;
  public environment!: EnvTex;
  public item!: ItemTex;

  async prepare() {
    registerSpriteBundles();
    [this.ui, this.hero, this.enemy, this.item, this.environment] =
      await Promise.all([
        loadBundle("ui"),
        loadBundle("hero"),
        loadBundle("enemy"),
        loadBundle("item"),
        loadBundle("environment"),
      ]);
  }
  initialize() {}
  execute() {}
}
