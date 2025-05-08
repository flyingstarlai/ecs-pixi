import { AssetLoadSystem } from "./AssetLoaderSystem.ts";
import { System } from "../../core/System.ts";
import {
  AnimatedSprite,
  Container,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js";
import { GridPosition } from "../../components/GridPosition.ts";
import {
  GoalTag,
  HeroTag,
  MonsterTag,
  DonutTag,
} from "../../components/Tags.ts";
import { Moving } from "../../components/Moving.ts";
import { Animation, AnimName } from "../../components/Animation.ts";
import { Entity } from "../../core/Entity.ts";
import { BoardRenderSystem } from "./BoardRenderSystem.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class EntityRenderSystem extends System {
  private container!: Container;
  private sprites = new Map<number, Sprite | AnimatedSprite>();
  private heroSheet!: Spritesheet;
  private enemy!: Texture;
  private donut!: Texture;
  private flag!: Texture;

  async prepare() {
    const assets = this.world.getSystem(AssetLoadSystem)!;
    const gridCtn = this.world.getSystem(BoardRenderSystem)!.gridCtn;
    console.log("gridCtn", gridCtn);
    this.heroSheet = assets.hero.atlas as unknown as Spritesheet;
    this.enemy = assets.enemy.monster;
    this.donut = assets.item.donut;
    this.flag = assets.item.flag;

    this.container = gridCtn;

    for (const [e] of this.query((q) =>
      q.with(GridPosition).withAny(HeroTag, MonsterTag, DonutTag),
    ))
      this.spawn(e);
  }

  execute() {
    for (const [e, grid] of this.query((q) =>
      q.with(GridPosition).withAny(HeroTag, MonsterTag),
    )) {
      const sp = this.sprites.get(e.id) ?? this.spawn(e);
      const anim = e.readComponent(Animation);
      const moving = e.readComponent(Moving);

      // 1) animation swap & play
      if (e.has(HeroTag) && anim && sp instanceof AnimatedSprite) {
        const tex = this.heroSheet.animations[anim.name];
        sp.alpha = 1;
        if (sp.textures !== tex) {
          sp.textures = tex;
          sp.loop = new Set([AnimName.idle, AnimName.walk]).has(anim.name);
          sp.gotoAndStop(0);
        }
        sp.animationSpeed = anim.fps / 60;
        if (anim.playing && !sp.playing) sp.play();
        if (!anim.playing && sp.playing) sp.stop();
        anim.frame = sp.currentFrame;
        if (
          anim.playing &&
          !new Set([AnimName.idle, AnimName.walk]).has(anim.name) &&
          sp.currentFrame === tex.length - 1
        ) {
          anim.playing = false;
          sp.gotoAndStop(anim.frame);
          sp.textures = this.heroSheet.animations[AnimName.idle];
        }
      }

      // 2) facing flip
      if (e.has(HeroTag) && moving) {
        sp.scale.x =
          moving.dstCol > moving.startCol
            ? 0.7
            : moving.dstCol < moving.startCol
              ? -0.7
              : sp.scale.x;
      }

      // 3) position (lerp or tile)
      const t = moving?.progress ?? 0;
      const cx = moving
        ? moving.startCol * (1 - t) + moving.dstCol * t
        : grid.col;
      const cy = moving
        ? moving.startRow * (1 - t) + moving.dstRow * t
        : grid.row;

      sp.position.set(
        cx * UIGame.TILE_SIZE + UIGame.TILE_SIZE / 2,
        cy * UIGame.TILE_SIZE + UIGame.TILE_SIZE / 2,
      );
    }
  }

  private spawn(e: Entity) {
    // TODO Scale using Component
    const anim = e.readComponent(Animation);
    let sp: Sprite | AnimatedSprite;

    sp = new Sprite(this.donut);
    sp.anchor.set(0.5);
    sp.scale.set(0.4);

    if (e.has(HeroTag)) {
      sp = new AnimatedSprite(this.heroSheet.animations[anim!.name]);
      console.log("Spawn Hero");
      sp.anchor.set(0.5);
      sp.scale.set(0.7);
    } else if (e.has(MonsterTag)) {
      sp = new Sprite(this.enemy);
      sp.anchor.set(0.5);
      sp.scale.set(0.4);
    } else if (e.has(GoalTag)) {
      sp = new Sprite(this.flag);
      sp.anchor.set(0.5);
      sp.scale.set(0.5);
      // sp.rotation = -Math.PI * 0.05;
    }

    this.container.addChild(sp);
    this.sprites.set(e.id, sp);
    return sp;
  }

  public getSpriteForEntity(id: number) {
    return this.sprites.get(id)!;
  }

  public removeSprite(id: number) {
    const sp = this.sprites.get(id);
    if (!sp) return;
    sp.parent?.removeChild(sp);
    sp.destroy({ children: true });
    this.sprites.delete(id);
    console.log("Removing Sprite: ", id);
  }
}
