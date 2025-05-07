import { Entity } from "./Entity";
import { Component, ComponentType } from "./Component";
import { World } from "./World";

/**
 * `Query<[]>::with(Position)::with(Velocity)`  →  Query<[Position, Velocity]>
 */
export class Query<Cs extends Component[]>
  implements Iterable<[Entity, ...Cs]>
{
  private readonly required: ComponentType<Component>[] = [];
  private any: ComponentType<Component>[] = [];

  constructor(private readonly world: World) {}

  /* ── fluent builder that extends the component tuple ─────────── */
  with<C extends Component>(ctor: ComponentType<C>): Query<[...Cs, C]> {
    this.required.push(ctor);
    // cast because we just widened the generic parameter
    return this as unknown as Query<[...Cs, C]>;
  }

  withAny<Os extends Component[]>(
    ...ctors: { [K in keyof Os]: ComponentType<Os[K]> }
  ): Query<Cs> {
    this.any.push(...(ctors as ComponentType<Component>[]));
    return this;
  }

  /* ── iterator that yields [entity, …components] ───────────────── */
  *[Symbol.iterator](): IterableIterator<[Entity, ...Cs]> {
    outer: for (const e of this.world.entities) {
      // 1️⃣  quick mismatch test
      for (const c of this.required) if (!e.has(c)) continue outer;

      // 2️⃣  collect the components – type-safe for the caller
      const comps = this.required.map((c) => e.readComponent(c)!) as Cs;
      yield [e, ...comps];
    }
  }
}
