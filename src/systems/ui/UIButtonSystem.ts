import { Container, Graphics, Rectangle } from "pixi.js";
import { System } from "../../core/System.ts";
import { UICommandSystem } from "./UICommandSystem.ts";
import { Command } from "../../components/Command.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { HeroTag } from "../../components/Tags.ts";
import { UIGame } from "../../constants/UIGame.ts";

const BTN_RADIUS = 20;
const BTN_POP = 1.2;
const BTN_POP_MS = 120;
const BTN_SHRINK_MS = 80;

export class UIButtonSystem extends System {
  private playStopBtn!: Container;
  private playCtn!: Container;
  private stpCtn!: Container;
  private isPlaying = false;

  private popActive = false;
  private popElapsed = 0;
  private popDuration1 = BTN_POP_MS;
  private popDuration2 = BTN_SHRINK_MS;

  private ui!: {
    commandCtn: Container;
    sourceCtn: Container;
    queueCtn: Container;
  };

  async prepare() {
    const ui = this.world.getSystem(UICommandSystem)!.ui;

    this.ui = {
      commandCtn: ui.commandCtn,
      sourceCtn: ui.sourceCtn,
      queueCtn: ui.queueCtn,
    };

    this.playStopBtn = new Container({ label: "ui_play_stop_container" });

    /* ------------------ play + stop  button --------------- */
    const playIcon = new Container({ label: "ui_splay_container" });
    const playCircle = new Graphics({ label: "play_cir" })
      .circle(0, 0, BTN_RADIUS)
      .fill(0x2ecc71);
    const tri = new Graphics({ label: "play_tri" })
      .poly([-6, -10, 10, 0, -6, 10])
      .fill(0xffffff);
    playIcon.addChild(playCircle, tri);
    this.playCtn = playIcon;

    const stopIcon = new Container({ label: "ui_stop_container" });
    const stopCircle = new Graphics({ label: "stop_cir" })
      .circle(0, 0, BTN_RADIUS)
      .fill(0xe74c3c);
    const sq = new Graphics({ label: "stop_sq" })
      .rect(-8, -8, 16, 16)
      .fill(0xffffff);
    stopIcon.addChild(stopCircle, sq);
    this.stpCtn = stopIcon;
    this.stpCtn.visible = false;

    this.playStopBtn.addChild(this.playCtn, this.stpCtn);
    this.playStopBtn.pivot.set(BTN_RADIUS, BTN_RADIUS);
    this.playStopBtn.position.set(
      UIGame.GAME_WIDTH - 32,
      BTN_RADIUS + UIGame.UI_QUEUE_H / 2,
    );
    this.playStopBtn.hitArea = new Rectangle(
      -BTN_RADIUS,
      -BTN_RADIUS,
      BTN_RADIUS * 2,
      BTN_RADIUS * 2,
    );
    this.playStopBtn.eventMode = "static";
    this.playStopBtn.cursor = "pointer";

    this.ui.commandCtn.addChild(this.playStopBtn);

    this.playStopBtn.on("pointertap", () => {
      this.popAnimation();

      if (!this.isPlaying) {
        this.world.getSystem(UICommandSystem)!.dispatchQueue();
      } else {
        this.world.getSystem(UICommandSystem)!.resetLevel();
      }
    });
  }

  execute(deltaMS: number) {
    const queries = this.query((q) => q.with(GridPosition).with(HeroTag));
    for (const [hero] of queries) {
      const playing = hero.readComponent(Command);
      this.togglePlayStopButton(!!playing);
    }

    if (this.popActive) {
      this.popElapsed += deltaMS;
      const half = this.popDuration1;
      const full = this.popDuration1 + this.popDuration2;
      let scale: number;

      if (this.popElapsed <= half) {
        // grow
        scale = 1 + (BTN_POP - 1) * (this.popElapsed / half);
      } else if (this.popElapsed <= full) {
        // shrink
        const t2 = this.popElapsed - half;
        scale = BTN_POP - (BTN_POP - 1) * (t2 / this.popDuration2);
      } else {
        // done
        scale = 1;
        this.popActive = false;
      }

      this.playStopBtn.scale.set(scale);
    }
  }

  private popAnimation() {
    this.popActive = true;
    this.popElapsed = 0;
  }

  private togglePlayStopButton(playing: boolean): void {
    this.isPlaying = playing;
    this.playCtn.visible = !playing;
    this.stpCtn.visible = playing;

    // ⬇️ Disable _all_ drag interactions when playing:
    this.ui.sourceCtn.interactiveChildren = !playing;
    this.ui.queueCtn.interactiveChildren = !playing;

    // ⬇️ (Optional) dim them so it’s clear they’re locked:
    this.ui.sourceCtn.alpha = playing ? 0.5 : 1;
    this.ui.queueCtn.alpha = playing ? 0.8 : 1;
  }
}
