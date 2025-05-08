import { System } from "../../core/System.ts";

export class InputLevelSystem extends System {
  public selectedLevel: number | null = null;

  execute(): void {
    // intentionally empty
  }

  initialize(): void {
    this.selectedLevel = null;
  }

  finalize(): void {
    this.selectedLevel = null;
  }
}
