import { World } from "./World.ts";

export abstract class Scene<P = void> {
  protected world!: World;
  protected params!: P;

  async prepare(world: World, params: P): Promise<void> {
    this.world = world;
    this.params = params;
    return this.onPrepare(params);
  }

  protected async onPrepare(_params: P): Promise<void> {}

  initialize?(world: World, params: P): void;

  execute?(world: World, deltaMS: number): void;
  finalize?(world: World): void;
}
