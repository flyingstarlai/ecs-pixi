import { Container, Graphics } from "pixi.js";
import { System } from "../../core/System.ts";
import { Tile, TileKind } from "../../components/Tile.ts";
import { UIGame } from "../../constants/UIGame.ts";
import { WorldContainerSystem } from "./WorldContainerSystem.ts";

const colorMap: Record<TileKind, number | null> = {
  empty: null,
  path: 0xffffff,
  start: 0xe7bfff,
  collectible: 0x00ff00,
  obstacle: 0xe03131,
  goal: 0x698dff,
};

export class BoardRenderSystem extends System {
  public container!: Container;
  public gridCtn!: Container;
  private initialKinds = new Map<number, TileKind>();
  private tileGfx = new Map<number, Graphics>();

  async prepare() {
    const worldCtn = this.world.getSystem(WorldContainerSystem)!.container;
    const gridW = UIGame.GRID_COLS * UIGame.TILE_SIZE,
      gridH = UIGame.GRID_ROWS * UIGame.TILE_SIZE;

    this.container = new Container({
      label: "board_container",
      position: { x: 0, y: UIGame.UI_STATS_H },
    });

    this.gridCtn = new Container({
      label: "grid_container",
      position: {
        x: (UIGame.BOARD_W - gridW) / 2,
        y: (UIGame.BOARD_H - gridH) / 2,
      },
    });

    const holder = new Graphics({ label: "board_holder" });
    holder.rect(0, 0, UIGame.BOARD_W, UIGame.BOARD_H).fill({
      color: 0xffffff,
      alpha: 0.1,
    });

    this.container.addChild(holder, this.gridCtn);

    worldCtn.addChild(this.container);

    for (const [e, tile] of this.query((q) => q.with(Tile))) {
      const g = new Graphics({ label: `tile_${tile.col}_${tile.row}` });
      g.position.set(tile.col * UIGame.TILE_SIZE, tile.row * UIGame.TILE_SIZE);
      this.gridCtn.addChild(g);
      this.tileGfx.set(e.id, g);
      this.initialKinds.set(e.id, tile.kind);
      this.redrawCell(g, tile.kind);
    }

    const lines = new Graphics({ label: "grid_debug_lines" }).moveTo(0, 0);
    for (let x = 0; x <= UIGame.GRID_COLS; x++)
      lines.moveTo(x * UIGame.TILE_SIZE, 0).lineTo(x * UIGame.TILE_SIZE, gridH);
    for (let y = 0; y <= UIGame.GRID_ROWS; y++)
      lines.moveTo(0, y * UIGame.TILE_SIZE).lineTo(gridW, y * UIGame.TILE_SIZE);
    lines.stroke({ color: 0xffffff, alpha: 0.5, pixelLine: true });
    this.gridCtn.addChild(lines);
  }

  execute() {
    /* static */
  }

  /** Redraw just one cell */
  public updateTile(eid: number, newKind: TileKind) {
    const g = this.tileGfx.get(eid);
    if (!g) return;
    this.redrawCell(g, newKind);
  }

  public resetAllTiles(): void {
    for (const [entityId, g] of this.tileGfx) {
      const orig = this.initialKinds.get(entityId);
      if (orig === undefined) continue;
      // update component data
      const entity = this.world.entities.find((e) => e.id === entityId);
      if (entity) {
        const tileComp = entity.writeComponent(Tile);
        tileComp.kind = orig;
      }
      this.redrawCell(g, orig);
    }
  }

  /** helper: clear+fill one Graphics */
  private redrawCell(g: Graphics, kind: TileKind) {
    g.clear();
    const c = colorMap[kind];
    if (c !== null) {
      g.rect(0, 0, UIGame.TILE_SIZE, UIGame.TILE_SIZE).fill({
        color: c,
        alpha: kind === "path" ? 0.5 : 1,
      });
    }
  }
}
