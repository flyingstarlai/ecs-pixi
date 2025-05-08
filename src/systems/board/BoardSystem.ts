// src/systems/BoardSystem.ts
import { System } from "../../core/System.ts";
import { Rotation } from "../../components/Rotation.ts";
import { Tile, TileKind } from "../../components/Tile.ts";
import {
  DonutTag,
  GoalTag,
  HeroTag,
  MonsterTag,
  TileTag,
} from "../../components/Tags.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { Animation, AnimName } from "../../components/Animation.ts";
import { CommandQueue } from "../../components/CommandQueue.ts";
import { Entity } from "../../core/Entity.ts";
import { StartPosition } from "../../components/StartPosition.ts";
import { StarBag } from "../../components/StarBag.ts";
import { EntityRenderSystem } from "../render/EntityRenderSystem.ts";
import { LevelConfig } from "../../components/LevelConfig.ts";
import { UIGame } from "../../constants/UIGame.ts";

/* ------------------------------------------------------------------ */

/* Demo “level” layout (edit / load from JSON later) -------------- */
const level: Record<TileKind, { col: number; row: number }[]> = {
  start: [{ col: 0, row: 3 }],
  collectible: [
    { col: 0, row: 2 },
    { col: 3, row: 2 },
  ],
  obstacle: [{ col: 2, row: 2 }],
  goal: [{ col: 4, row: 0 }],
  path: [
    { col: 1, row: 3 },
    { col: 0, row: 3 },
    { col: 0, row: 2 },
    { col: 1, row: 2 },
    { col: 2, row: 2 },
    { col: 3, row: 2 },
    { col: 3, row: 1 },
    { col: 3, row: 0 },
    { col: 4, row: 0 },
  ],
  empty: [],
};

/* ------------------------------------------------------------------ */
export class BoardSystem extends System {
  private donutPositions: { col: number; row: number }[] = [];
  private monsterPositions: { col: number; row: number }[] = [];
  private goalPositions: { col: number; row: number }[] = [];
  private startPositions: { col: number; row: number }[] = [];

  constructor(private levelId: number) {
    super();
  }

  /* All work is done up-front; nothing to do every frame */
  async prepare() {
    console.log(`Loading level: ${this.levelId}`);
    this.createLevel(level.collectible.length, level.obstacle.length);
    this.spawnTiles();

    this.donutPositions = [...level.collectible];
    this.monsterPositions = [...level.obstacle];
    this.goalPositions = [...level.goal];
    this.startPositions = [...level.start];

    this.spawnBoardEntities(new CommandQueue());
  }

  execute(): void {}

  /* ---------- helpers -------------------------------------------- */

  private kindAt(col: number, row: number): TileKind {
    for (const [kind, list] of Object.entries(level)) {
      if (
        list.some(
          (p: { col: number; row: number }) => p.col === col && p.row === row,
        )
      )
        return kind as TileKind;
    }
    return "empty";
  }

  private createLevel(
    requiredDonuts: number,
    requiredKills: number,
    maxPath = 11,
  ) {
    this.world
      .createEntity()
      .addComponent(
        LevelConfig,
        new LevelConfig(requiredDonuts, requiredKills, maxPath),
      );
  }

  private spawnTiles(): void {
    for (let r = 0; r < UIGame.GRID_ROWS; r++) {
      for (let c = 0; c < UIGame.GRID_COLS; c++) {
        const kind = this.kindAt(c, r);
        this.world
          .createEntity()
          .addComponent(Tile, new Tile(c, r, kind))
          .addComponent(TileTag);
      }
    }
  }

  private spawnHero(col: number, row: number, cmdQueue: CommandQueue): Entity {
    return this.world
      .createEntity()
      .addComponent(GridPosition, new GridPosition(col, row))
      .addComponent(Rotation)
      .addComponent(Animation, new Animation(AnimName.idle, 0, 10, true))
      .addComponent(CommandQueue, cmdQueue)
      .addComponent(StarBag)
      .addComponent(HeroTag);
  }

  private spawnMonster(col: number, row: number): void {
    this.world
      .createEntity()
      .addComponent(GridPosition, new GridPosition(col, row))
      .addComponent(Rotation)
      .addComponent(MonsterTag);
  }

  private spawnDonut(col: number, row: number): void {
    this.world
      .createEntity()
      .addComponent(GridPosition, new GridPosition(col, row))
      .addComponent(Rotation)
      .addComponent(DonutTag);
  }

  private spawnGoal(col: number, row: number): void {
    this.world
      .createEntity()
      .addComponent(GridPosition, new GridPosition(col, row))
      .addComponent(Rotation)
      .addComponent(GoalTag);
  }

  public spawnBoardEntities(cmdQueue: CommandQueue): void {
    this.donutPositions.forEach(({ col, row }) => this.spawnDonut(col, row));
    this.monsterPositions.forEach(({ col, row }) =>
      this.spawnMonster(col, row),
    );
    this.goalPositions.forEach(({ col, row }) => this.spawnGoal(col, row));
    this.startPositions.forEach(({ col, row }) =>
      this.spawnHero(col, row, cmdQueue).addComponent(
        StartPosition,
        new StartPosition(col, row),
      ),
    );
  }

  public resetBoardEntities(): void {
    for (const [e] of this.query((q) => q.with(DonutTag))) {
      this.world.getSystem(EntityRenderSystem)?.removeSprite(e.id);
      this.world.removeEntity(e);
    }

    for (const [e] of this.query((q) => q.with(MonsterTag))) {
      this.world.getSystem(EntityRenderSystem)?.removeSprite(e.id);
      this.world.removeEntity(e);
    }

    for (const [e] of this.query((q) => q.with(GoalTag))) {
      this.world.getSystem(EntityRenderSystem)?.removeSprite(e.id);
      this.world.removeEntity(e);
    }

    let cmdQueue: CommandQueue = new CommandQueue();

    for (const [e, cmd] of this.query((q) =>
      q.with(CommandQueue).with(HeroTag),
    )) {
      this.world.removeEntity(e);
      cmdQueue = cmd;
      this.world.getSystem(EntityRenderSystem)?.removeSprite(e.id);
    }

    this.spawnBoardEntities(cmdQueue);
  }
}
