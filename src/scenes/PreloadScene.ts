import { AssetLoadSystem } from "../systems/render/AssetLoaderSystem.ts";
import { Scene } from "../core/Scene.ts";
import { SceneNavigator } from "../core/SceneNavigator.ts";
import { ScenesMap } from "./index.ts";

export class PreloadScene extends Scene {
  constructor(private nav: SceneNavigator<ScenesMap>) {
    super();
    console.log("PreloadScene");
  }

  protected override async onPrepare(): Promise<void> {
    // register only the loader system
    this.world.addSystem(new AssetLoadSystem());
  }

  override execute(_: typeof this.world, _dt: number): void {
    const loader = this.world.getSystem(AssetLoadSystem)!;
    console.log(`Loader`, loader.isDone);
    if (loader.isDone) {
      // once assets finished loading, jump to level select
      this.nav.switch("LevelSelect", undefined).catch(() => {});
    }
  }
}
