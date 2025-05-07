import { System } from "../../core/System.ts";
import { PixiAppSystem } from "./PixiAppSystem.ts";
import { Application, Container } from "pixi.js";
import { WindowSize } from "../../components/WindowSize.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class ResponsiveSystem extends System {
  private app!: Application;
  private root!: Container;
  private sizeEntityId!: number;
  private resizeHandler!: () => void;

  async prepare() {
    this.app = this.world.getSystem(PixiAppSystem)!.app;
    this.root = this.app.stage;

    const existing = [...this.query((q) => q.with(WindowSize))][0];
    if (existing) {
      this.sizeEntityId = existing[0].id;
    } else {
      const e = this.world
        .createEntity()
        .addComponent(WindowSize, new WindowSize(0, 0));
      this.sizeEntityId = e.id;
    }

    this.resizeHandler = () => {
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      const vw = UIGame.GAME_WIDTH;
      const vh = UIGame.GAME_HEIGHT;

      const [, size] = [...this.query((q) => q.with(WindowSize))].find(
        ([ent, _]) => ent.id === this.sizeEntityId,
      )!;
      size.width = ww;
      size.height = wh;

      this.app.renderer.resize(ww, wh);

      const scaleX = ww / vw;
      const scaleY = wh / vh;
      const scale = Math.min(scaleX, scaleY);

      console.log("Root scale", scale);

      this.root.scale.set(scale, scale);
      this.root.position.set((ww - vw * scale) / 2, (wh - vh * scale) / 2);
    };
    window.addEventListener("resize", () => this.resizeHandler());

    this.resizeHandler();
  }

  finalize(): void {
    window.removeEventListener("resize", this.resizeHandler);
  }
}
