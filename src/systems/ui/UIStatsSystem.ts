import { System } from "../../core/System.ts";
import { Container, Sprite, Texture } from "pixi.js";
import { LevelConfig } from "../../components/LevelConfig.ts";
import { StarBag } from "../../components/StarBag.ts";
import { AssetLoadSystem } from "../render/AssetLoaderSystem.ts";
import { UIContainerSystem } from "./UIContainerSystem.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class UIStatsSystem extends System {
  private stars: Sprite[] = [];
  private required = 0;
  private uiStatsCtn!: Container;
  private uiCtn!: Container;

  private emptyTex!: Texture;
  private fullTex!: Texture;

  initialize() {
    this.uiCtn = this.world.getSystem(UIContainerSystem)!.container;

    const asset = this.world.getSystem(AssetLoadSystem)!.item;
    this.emptyTex = asset.donutEmpty;
    this.fullTex = asset.donut;

    this.uiStatsCtn = new Container({
      label: "ui_stats_container",
    });

    const collectibleCtn = new Container({
      label: "collectible_container",
    });

    this.uiStatsCtn.addChild(collectibleCtn);
    this.uiCtn.addChild(this.uiStatsCtn);

    const [[, cfg]] = [...this.query((q) => q.with(LevelConfig))];

    this.required = cfg.requiredDonuts;

    // position stars from right to left
    const spacing = 40;
    for (let i = 0; i < this.required; i++) {
      const sp = new Sprite({
        texture: this.fullTex,
        label: `collectible_${i}`,
      });
      const gridW = UIGame.GRID_COLS * UIGame.TILE_SIZE;
      const gridL = (UIGame.BOARD_W - gridW) / 2 + gridW;
      sp.anchor.set(1, 0);
      sp.width = 40;
      sp.height = 40;
      sp.position.set(gridL - i * spacing, 0);
      collectibleCtn.addChild(sp);
      this.stars.push(sp);
    }
  }

  execute(): void {
    // find the hero’s bag
    const bagTuple = [...this.query((q) => q.with(StarBag))][0];
    if (!bagTuple) return;
    const bag = bagTuple[1];

    // update tints
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].texture = i < bag.count ? this.fullTex : this.emptyTex;
    }
  }
}
