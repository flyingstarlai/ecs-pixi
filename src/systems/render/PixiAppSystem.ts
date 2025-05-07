import { Application, Container } from "pixi.js";
import { initDevtools } from "@pixi/devtools";

import { System } from "../../core/System.ts";

export class PixiAppSystem extends System {
  public app!: Application;
  public gameCtn!: Container;

  async prepare() {
    this.app = new Application();
    const pixiContainer = document.getElementById("pixi-container")!;

    await this.app.init({
      background: "#1099bb",
      resolution: Math.max(window.devicePixelRatio, 2),
    });
    pixiContainer.appendChild(this.app.canvas);
    await initDevtools({ app: this.app });
  }

  initialize() {
    this.app.ticker.add(({ deltaMS }) => this.world.execute(deltaMS));
  }

  execute() {}
  finalize() {
    this.app.destroy(true, { children: true });
  }
}
