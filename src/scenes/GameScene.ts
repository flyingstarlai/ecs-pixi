import { Scene } from "../core/Scene.ts";
import { SceneNavigator } from "../core/SceneNavigator.ts";
import { BoardSystem } from "../systems/board/BoardSystem.ts";
import { InputSystem } from "../systems/input/InputSystem.ts";
import { MovementSystem } from "../systems/board/MovementSystem.ts";
import { BoardRenderSystem } from "../systems/render/BoardRenderSystem.ts";
import { UIStatsSystem } from "../systems/ui/UIStatsSystem.ts";
import { EntityRenderSystem } from "../systems/render/EntityRenderSystem.ts";
import { CollectionSystem } from "../systems/board/CollectionSystem.ts";
import { EndRatingSystem } from "../systems/board/EndRatingSystem.ts";
import { AttackSystem } from "../systems/board/AttackSystem.ts";
import { UICommandSystem } from "../systems/ui/UICommandSystem.ts";
import { UIButtonSystem } from "../systems/ui/UIButtonSystem.ts";
import { UIPopupSystem } from "../systems/ui/UIPopUpSystem.ts";
import { CommandProcessorSystem } from "../systems/board/CommandProcessorSystem.ts";
import { DeathSystem } from "../systems/board/DeathSystem.ts";
import { DebugSystem } from "../systems/debug/DebugSystem.ts";
import { ScenesMap } from "./index.ts";

export interface GameParams {
  levelId: number;
}

export class GameScene extends Scene<ScenesMap["Game"]> {
  constructor(_nav: SceneNavigator<ScenesMap>, params: ScenesMap["Game"]) {
    super();
    this.params = params;
  }

  protected override async onPrepare(params: ScenesMap["Game"]): Promise<void> {
    // Level-specific setup
    this.world
      // Game logic systems
      .addSystem(new BoardSystem(params.levelId))
      .addSystem(new InputSystem())
      .addSystem(new MovementSystem())
      .addSystem(new CommandProcessorSystem())
      .addSystem(new CollectionSystem())
      .addSystem(new AttackSystem())

      .addSystem(new EndRatingSystem())
      // Rendering systems
      .addSystem(new BoardRenderSystem())
      .addSystem(new EntityRenderSystem())
      .addSystem(new UIStatsSystem())
      .addSystem(new UICommandSystem())
      .addSystem(new UIButtonSystem())
      .addSystem(new UIPopupSystem())
      .addSystem(new DeathSystem())

      // Debug
      .addSystem(new DebugSystem());
  }

  override execute(_: typeof this.world, _dt: number): void {
    // all the game flow happens inside your ECS systems
    // you can still check for “back to menu” here if you like:
    // if (someCondition) this.nav.switch('LevelSelect', undefined);
  }
}
