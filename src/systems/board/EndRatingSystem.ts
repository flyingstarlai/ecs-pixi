import { System } from "../../core/System.ts";
import { EndCondition } from "../../components/EndCondition.ts";
import { HeroTag, MonsterTag } from "../../components/Tags.ts";
import { EndRating } from "../../components/EndRating.ts";
import { StarBag } from "../../components/StarBag.ts";
import { CommandQueue } from "../../components/CommandQueue.ts";
import { LevelConfig } from "../../components/LevelConfig.ts";

export class EndRatingSystem extends System {
  execute() {
    for (const [hero, end] of this.query((q) =>
      q.with(EndCondition).with(HeroTag),
    )) {
      if (hero.has(EndRating)) continue;

      if (end.type === "failure") {
        console.log("Adding EndRating", hero);
        hero.addComponent(EndRating);
        continue;
      }

      const bag = hero.readComponent(StarBag)!;
      const queue = hero.readComponent(CommandQueue)!;
      const [[, cfg]] = this.query((q) => q.with(LevelConfig));

      let stars = 0;
      if (cfg.requiredDonuts === 0 || bag?.count >= cfg.requiredDonuts) {
        stars++;
      }

      const liveMon = this.query((q) => q.with(MonsterTag));
      if (cfg.requiredKills === 0 || Array.from(liveMon).length === 0) {
        stars++;
      }

      if (queue?.queue.length <= cfg.maxPath) {
        stars++;
      }

      console.log("Got stars", stars);

      hero.addComponent(EndRating, new EndRating(stars));
    }
  }
}
