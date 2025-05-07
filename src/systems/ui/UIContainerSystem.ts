import { System } from "../../core/System.ts";
import { Container } from "pixi.js";
import { PixiAppSystem } from "../render/PixiAppSystem.ts";

export class UIContainerSystem extends System {
  /** Root container for UI elements */
  public container!: Container;

  async prepare() {
    const pixiSys = this.world.getSystem(PixiAppSystem);
    if (!pixiSys) {
      throw new Error(
        "PixiAppSystem must be registered before UIContainerSystem",
      );
    }
    const app = pixiSys.app;

    // Create UI container and add it above the world container
    this.container = new Container({ label: "ui_container" });
    // Ensure UI is on top by adding after world container
    app.stage.addChild(this.container);
  }

  execute(): void {
    // no per-frame logic; UI systems will populate this.container
  }

  finalize(): void {
    // Clean up UI on shutdown
    this.container.destroy({ children: true });
  }
}
