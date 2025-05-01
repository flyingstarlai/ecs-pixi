import { Entity } from "./Entity";
import { Component, ComponentType } from "./Component";
import { World } from "./World";

/**
 * Light-weight fluent filter.  Type-safety here is deliberately relaxed so that
 * the API stays terse; you still get strong typing once you read/write the
 * components from the entity itself.
 */
export class Query {
  private required = new Set<ComponentType>();

  constructor(private readonly world: World) {}

  with<C extends Component>(component: ComponentType<C>): this {
    this.required.add(component as ComponentType);
    return this;
  }

  /** Iterate entities matching *all* required components. */
  *entities(): IterableIterator<Entity> {
    outer: for (const e of this.world.entities) {
      for (const req of this.required) {
        if (!e.has(req)) continue outer;
      }
      yield e;
    }
  }

  [Symbol.iterator](): IterableIterator<Entity> {
    return this.entities();
  }
}
