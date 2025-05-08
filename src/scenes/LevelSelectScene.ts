import { SceneNavigator } from "../core/SceneNavigator.ts";
import { Scene } from "../core/Scene.ts";
import { UILevelSelectionSystem } from "../systems/ui/UILevelSelectionSystem.ts";
import { InputLevelSystem } from "../systems/input/InputLevelSystem.ts";
import { World } from "../core/World.ts";
import { ScenesMap } from "./index.ts";

export class LevelSelectScene extends Scene<ScenesMap["LevelSelect"]> {
  constructor(private nav: SceneNavigator<ScenesMap>) {
    super();
    console.log("LevelSelectScene");
  }

  /**
   * Register only the level‐selection input & UI systems.
   */
  protected override async onPrepare(
    _: ScenesMap["LevelSelect"],
  ): Promise<void> {
    this.world
      .addSystem(new InputLevelSystem())
      .addSystem(new UILevelSelectionSystem());
  }

  override execute(world: World, _deltaMS: number): void {
    const input = world.getSystem(InputLevelSystem)!;
    const lvl = input.selectedLevel;
    if (lvl === null) return;
    this.nav.switch("Game", { levelId: lvl }).catch(() => {});
  }

  override finalize(world: World): void {
    console.log("Finalize LevelSelectScene");
    world.removeSystem(InputLevelSystem);
    world.removeSystem(UILevelSelectionSystem);
  }
}
