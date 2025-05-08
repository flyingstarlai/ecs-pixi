import type { World } from "./World";
import { Query } from "./Query";
import { Entity } from "./Entity.ts";
import { Component } from "./Component.ts";

/**
 * Base class for all game systems.
 *
 * ✔ `world` is injected by `World.addSystem()` – don't access it in the ctor!
 */
export abstract class System {
  /** Populated by the world right before `prepare()` is called. */
  #world!: World;

  persistent = false;
  _hasRunPrepare = false;

  /** Internal – called by World once the system is registered. */
  _attach(world: World): void {
    this.#world = world;
  }

  async prepare(): Promise<void> {}
  initialize(): void {}
  execute(_delta: number): void {}
  finalize(): void {}

  protected get world(): World {
    return this.#world;
  }

  /** Fluent entity filter identical to the previous API. */
  protected query<B extends Component[]>(
    build: (q: Query<[]>) => Query<B>,
  ): Iterable<[Entity, ...B]> {
    return build(new Query<[]>(this.#world));
  }
}
