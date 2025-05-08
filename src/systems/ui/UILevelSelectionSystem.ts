import { System } from "../../core/System.ts";
import {
  Container,
  Graphics,
  TextStyle,
  Text,
  FederatedPointerEvent,
} from "pixi.js";
import { InputLevelSystem } from "../input/InputLevelSystem.ts";
import { UIContainerSystem } from "./UIContainerSystem.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class UILevelSelectionSystem extends System {
  private container!: Container;

  persistent = true;

  async prepare(): Promise<void> {
    const uiCtn = this.world.getSystem(UIContainerSystem)!.container;

    this.container = new Container({ label: "ui_level_selector_container" });
    uiCtn.addChild(this.container);

    // this.container.addChild(holder);

    const buttonWidth = 80;
    const buttonHeight = 60;
    const spacing = 20;
    // Define available levels (could come from config)
    const levels = [1, 2, 3, 4, 5];

    levels.map((lvl, idx) => {
      const btn = new Container();
      btn.position.set(
        (buttonWidth + spacing) * idx,
        // center vertically in UI container
        UIGame.GAME_HEIGHT / 2 - buttonHeight / 2,
      );
      btn.eventMode = "static";
      btn.cursor = "pointer";

      // Background box
      const bg = new Graphics()
        .roundRect(0, 0, buttonWidth, buttonHeight, 10)
        .fill({ color: 0x4a90e2 });

      // Label
      const label = new Text({
        text: `Level ${lvl}`,
        style: new TextStyle({
          fontSize: 14,
          fill: 0xffffff,
          fontWeight: "bold",
        }),
      });
      label.anchor.set(0.5);
      label.position.set(buttonWidth / 2, buttonHeight / 2);

      btn.addChild(bg, label);

      btn.on("pointertap", (_: FederatedPointerEvent) => {
        const input = this.world.getSystem(InputLevelSystem)!;
        input.selectedLevel = lvl;
      });

      this.container.addChild(btn);
    });

    this.container.position.set(this.container.width / 2, 0);
  }
  execute(_delta: number) {
    super.execute(_delta);
  }

  finalize(): void {
    console.log("Finalize UILevelSelection");
    this.container.destroy({ children: true });
  }
}
