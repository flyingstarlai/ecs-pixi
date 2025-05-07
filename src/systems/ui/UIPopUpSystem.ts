import { System } from "../../core/System.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { EndCondition } from "../../components/EndCondition.ts";
import { HeroTag } from "../../components/Tags.ts";
import { UICommandSystem } from "./UICommandSystem.ts";
import { Command } from "../../components/Command.ts";
import { Moving } from "../../components/Moving.ts";
import { Tile } from "../../components/Tile.ts";
import { EndRating } from "../../components/EndRating.ts";

export class UIPopupSystem extends System {
  private successPopup!: HTMLElement;
  private failurePopup!: HTMLElement;
  private delayMs = 0; // countdown timer
  private shown = false;
  private retryNextBtn!: HTMLElement;

  async prepare() {
    this.successPopup = document.getElementById("popup-success")!;
    this.failurePopup = document.getElementById("popup-failure")!;
    const uiCommand = this.world.getSystem(UICommandSystem)!;

    document.getElementById("btn-next-level")!.onclick = () => {
      this.hideAllPopups();
    };
    document.getElementById("btn-retry")!.onclick = () => {
      uiCommand.resetLevel();
      this.hideAllPopups();
    };

    this.retryNextBtn = document.getElementById("btn-next-retry")!;

    this.retryNextBtn.onclick = () => {
      uiCommand.resetLevel();
      this.hideAllPopups();
    };
  }

  execute(deltaMs: number): void {
    const queries = this.query((q) => q.with(GridPosition).with(HeroTag));
    for (const [hero, grid] of queries) {
      if (hero.has(EndCondition)) {
        if (this.shown) return;
        if (this.delayMs <= 0) {
          this.delayMs = 800;
        }

        this.delayMs -= deltaMs;
        if (this.delayMs <= 0) {
          const result = hero.readComponent(EndCondition);
          this.shown = true;
          if (result) {
            if (result.type === "success")
              this.showSuccessPopup(hero.readComponent(EndRating)!.stars);
            else if (result.type === "failure") this.showFailurePopup();
          }
          return;
        }
      }

      if (hero.has(Command)) return;
      if (hero.has(Moving)) return;

      const atStart = [...this.query((q) => q.with(Tile))].some(
        ([, tile]) =>
          tile.col === grid.col &&
          tile.row === grid.row &&
          tile.kind === "start",
      );

      if (atStart) return;

      const reachedGoal = [...this.query((q) => q.with(Tile))].some(
        ([, tile]) =>
          tile.col === grid.col &&
          tile.row === grid.row &&
          tile.kind === "goal",
      );

      if (reachedGoal) {
        hero.addComponent(EndCondition, new EndCondition("success"));
      } else {
        hero.addComponent(EndCondition, new EndCondition("failure"));
      }
      this.world.getSystem(UICommandSystem)!.rebuildQueueRow();
    }
  }

  private hideAllPopups() {
    this.successPopup.classList.add("hidden");
    this.failurePopup.classList.add("hidden");
  }

  private showSuccessPopup(rating: number) {
    this.delayMs = 0;
    this.shown = false;
    this.hideAllPopups();

    for (let i = 1; i <= 3; i++) {
      const img = document.getElementById(`star${i}`) as HTMLImageElement;
      if (!img) continue;
      img.src =
        i <= rating
          ? "/assets/star.png" // filled star
          : "/assets/starEmpty.png"; // empty star
    }

    if (rating < 3) {
      this.retryNextBtn.classList.remove("hidden");
    } else {
      this.retryNextBtn.classList.add("hidden");
    }

    this.successPopup.classList.remove("hidden");
  }

  private showFailurePopup() {
    this.delayMs = 0;
    this.shown = false;
    this.hideAllPopups();
    this.failurePopup.classList.remove("hidden");
  }
}
