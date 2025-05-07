import { System } from "../../core/System.ts";
import { Container, Graphics } from "pixi.js";
import { PixiAppSystem } from "./PixiAppSystem.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class WorldContainerSystem extends System {
  public container!: Container;

  async prepare() {
    const pixiSys = this.world.getSystem(PixiAppSystem);
    if (!pixiSys) {
      throw new Error(
        "PixiAppSystem must be registered before WorldContainerSystem",
      );
    }

    const app = pixiSys.app;

    this.container = new Container({ label: "world_container" });
    const holder = new Graphics({ label: "world_holder" });
    holder.rect(0, 0, UIGame.GAME_WIDTH, UIGame.GAME_HEIGHT).fill({
      color: 0xffffff,
      alpha: 0.1,
    });
    this.container.addChild(holder);
    app.stage.addChild(this.container);
  }

  finalize() {
    this.container.destroy({ children: true });
  }
}
