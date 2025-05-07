import {
  Container,
  FederatedPointerEvent,
  Graphics,
  Rectangle,
  Text,
} from "pixi.js";
import { System } from "../../core/System.ts";
import { CommandQueue, CommandType } from "../../components/CommandQueue.ts";
import { HeroTag } from "../../components/Tags.ts";
import { Command } from "../../components/Command.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { BoardRenderSystem } from "../render/BoardRenderSystem.ts";
import { BoardSystem } from "../board/BoardSystem.ts";
import { UIContainerSystem } from "./UIContainerSystem.ts";
import { UIGame } from "../../constants/UIGame.ts";

interface QueueOpt {
  withGhost?: boolean;
  highlight?: number;
}

export class UICommandSystem extends System {
  public ui!: {
    commandCtn: Container;
    sourceCtn: Container;
    queueCtn: Container;
  };

  private ghostIdx: number | null = null;
  async prepare() {
    const uiCtn = this.world.getSystem(UIContainerSystem)!.container;
    this.ui = {
      commandCtn: new Container({
        label: "ui_command_container",
        position: { x: 0, y: UIGame.UI_STATS_H + UIGame.BOARD_H },
      }),
      sourceCtn: new Container({
        label: "ui_source_container",
        position: { x: 0, y: UIGame.UI_QUEUE_H },
      }),
      queueCtn: new Container({
        label: "ui_queue_container",
      }),
    };

    const qHolder = new Graphics({ label: "queue_holder" })
      .rect(0, 0, UIGame.GAME_WIDTH, UIGame.UI_QUEUE_H)
      .fill({
        color: 0xefefef,
        alpha: 0.1,
      });
    this.ui.queueCtn.addChild(qHolder);

    const sHolder = new Graphics({ label: "source_holder" })
      .rect(0, 0, UIGame.GAME_WIDTH, UIGame.UI_SRC_H)
      .fill({
        color: 0xefefef,
        alpha: 0.2,
      });
    this.ui.sourceCtn.addChild(sHolder);

    this.ui.commandCtn.addChild(this.ui.queueCtn, this.ui.sourceCtn);

    this.ui.commandCtn.eventMode = "static";
    this.ui.commandCtn.hitArea = new Rectangle(
      0,
      0,
      UIGame.GAME_WIDTH,
      UIGame.UI_SRC_H + UIGame.UI_QUEUE_H,
    );

    uiCtn.addChild(this.ui.commandCtn);
    this.spawnSourceSlots();
  }

  execute() {
    const queries = this.query((q) => q.with(GridPosition).with(HeroTag));
    for (const [hero] of queries) {
      const playing = hero.readComponent(Command);

      if (playing) {
        this.rebuildQueueRow({
          highlight: playing.pending,
        });
      }
    }
  }

  public dispatchQueue() {
    const heroId = this.ensureHeroRef();
    const hero = this.world.entities.find((e) => e.id === heroId)!;
    hero.addComponent(Command);
  }

  public resetLevel() {
    this.world.getSystem(BoardRenderSystem)!.resetAllTiles();
    this.world.getSystem(BoardSystem)?.resetBoardEntities();
    this.rebuildQueueRow();
  }

  private spawnSourceSlots() {
    const icons: [CommandType, string][] = [
      [CommandType.MoveRight, "→"],
      [CommandType.MoveLeft, "←"],
      [CommandType.MoveUp, "↑"],
      [CommandType.MoveDown, "↓"],
      [CommandType.Jump, "๑"],
      [CommandType.Attack, "⚔"],
    ];

    icons.forEach(([cmd, label], i) => {
      const slot = this.makeSlot(label);
      slot.position.x = i * UIGame.SLOT_SIZE + UIGame.SLOT_SIZE;
      slot.position.y = UIGame.UI_SRC_H / 2;
      slot.eventMode = "static";
      slot.cursor = "grab";
      slot.on("pointerdown", (e) => this.startDrag(e, cmd, true));
      this.ui.sourceCtn.addChild(slot);
    });
  }

  private makeSlot(text: string, ring: boolean = false): Container {
    const c = new Container({ label: `src_${text}` });
    const boxSize = UIGame.SLOT_SIZE - 4;
    c.pivot.set(boxSize / 2, boxSize / 2);
    const box = new Graphics()
      .roundRect(0, 0, boxSize, boxSize, 8)
      .fill(0x1e90ff);

    if (ring) {
      box.stroke({ width: 3, color: "0x00ff00" });
    }

    const lbl = new Text({
      text,
      style: { fill: 0xffffff, fontSize: boxSize / 2 },
    });
    lbl.anchor.set(0.5);
    lbl.position.set(boxSize / 2, boxSize / 2);
    c.addChild(box, lbl);
    return c;
  }

  private startDrag(
    e: FederatedPointerEvent,
    cmd: CommandType,
    isCopy: boolean,
  ) {
    const icon = (
      isCopy ? this.makeSlot(this.symbol(cmd)) : e.currentTarget
    ) as Container;
    this.ui.commandCtn.addChild(icon);
    icon.position.copyFrom(this.ui.commandCtn.toLocal(e.global));
    icon.eventMode = "static";
    icon.cursor = "grabbing";
    icon.alpha = 0.8;

    const moveFn = (m: FederatedPointerEvent) => {
      icon.position.copyFrom(this.ui.commandCtn.toLocal(m.global));
      const newIdx = Math.floor(
        (icon.position.x + UIGame.SLOT_SIZE / 2) / UIGame.SLOT_SIZE,
      );

      if (newIdx !== this.ghostIdx && icon.position.y <= UIGame.UI_QUEUE_H) {
        this.ghostIdx = newIdx;
        this.rebuildQueueRow({ withGhost: true });
      }
    };
    const upFn = () => {
      this.ui.commandCtn.off("pointermove", moveFn);
      this.ui.commandCtn.off("pointerup", upFn);
      this.ui.commandCtn.off("pointerupoutside", upFn);
      this.dropIcon(icon, cmd);
    };

    this.ui.commandCtn.on("pointermove", moveFn);
    this.ui.commandCtn.on("pointerup", upFn);
    this.ui.commandCtn.on("pointerupoutside", upFn);
  }

  private dropIcon(icon: Container, cmd: CommandType) {
    const rowW = UIGame.GAME_WIDTH;
    const rowH = UIGame.UI_QUEUE_H;

    const inside =
      icon.position.x >= 0 &&
      icon.position.x <= rowW &&
      icon.position.y >= 0 &&
      icon.position.y <= rowH;

    const queue = this.queue();

    if (inside) {
      const rawIdx = Math.floor(
        (icon.position.x + UIGame.SLOT_SIZE / 2) / UIGame.SLOT_SIZE,
      );
      const idx = Math.max(0, Math.min(rawIdx, queue.length));

      // insert or append
      if (idx >= 0 && idx <= queue.length) {
        queue.splice(idx, 0, cmd);
      } else {
        queue.push(cmd);
      }
    }

    // rebuild the queue row visuals
    this.ghostIdx = null;
    this.rebuildQueueRow();
    icon.destroy(); // remove drag sprite
  }

  public rebuildQueueRow(queueOpt?: QueueOpt) {
    this.ui.queueCtn.removeChildren();

    const qHolder = new Graphics({ label: "queue_holder" })
      .rect(0, 0, UIGame.GAME_WIDTH, UIGame.UI_QUEUE_H)
      .fill({
        color: 0xefefef,
        alpha: 0.1,
      });
    this.ui.queueCtn.addChild(qHolder);

    this.queue().forEach((cmd, i) => {
      const slot = this.makeSlot(this.symbol(cmd), queueOpt?.highlight === i);
      const xPos = i * UIGame.SLOT_SIZE + UIGame.SLOT_SIZE;
      slot.position.y = UIGame.UI_QUEUE_H / 2;
      if (queueOpt?.withGhost && this.ghostIdx !== null && i >= this.ghostIdx) {
        slot.position.x = xPos + UIGame.SLOT_SIZE;
      } else {
        slot.position.x = xPos;
      }

      slot.eventMode = "static";
      slot.cursor = "grab";

      // drag-to-reorder (move, not copy)
      slot.on("pointerdown", (e) => {
        // remove from queue before drag starts
        this.queue().splice(i, 1);
        this.startDrag(e, cmd, false);
        this.rebuildQueueRow();
      });

      this.ui.queueCtn.addChild(slot);
    });

    if (
      queueOpt?.withGhost &&
      this.ghostIdx !== null &&
      this.ghostIdx <= this.queue().length
    ) {
      const boxSize = UIGame.SLOT_SIZE - 4;
      const phantom = new Graphics({ label: "phantom_box" })
        .roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, 8)
        .stroke({ color: 0xffffff, alpha: 0.5, pixelLine: true });
      phantom.position.x = this.ghostIdx * UIGame.SLOT_SIZE + UIGame.SLOT_SIZE;
      phantom.position.y = UIGame.UI_QUEUE_H / 2;
      this.ui.queueCtn.addChild(phantom);
    }
  }

  public ensureHeroRef() {
    const hero = this.world.entities.find((e) => e.has(HeroTag));
    if (!hero) throw new Error("Hero entity not found");

    return hero.id;
  }

  private queue(): CommandType[] {
    const heroId = this.ensureHeroRef();
    return this.world.entities
      .find((e) => e.id === heroId)!
      .writeComponent(CommandQueue).queue;
  }

  private symbol(cmd: CommandType): string {
    return cmd === CommandType.MoveRight
      ? "→"
      : cmd === CommandType.MoveLeft
        ? "←"
        : cmd === CommandType.MoveUp
          ? "↑"
          : cmd === CommandType.MoveDown
            ? "↓"
            : cmd === CommandType.Attack
              ? "⚔"
              : "๑";
  }
}
