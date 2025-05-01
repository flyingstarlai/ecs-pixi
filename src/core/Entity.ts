import { Component, ComponentType } from "./Component";

let _nextId = 0;

export class Entity {
  readonly id = _nextId++;
  private readonly components = new Map<ComponentType, Component>();

  addComponent<C extends Component>(
    ctor: ComponentType<C>,
    instance = new ctor(),
  ): this {
    this.components.set(ctor, instance);
    return this;
  }

  /** Read-only reference (undefined if not present). */
  readComponent<C extends Component>(ctor: ComponentType<C>): C | undefined {
    return this.components.get(ctor) as C | undefined;
  }

  /** Same as readComponent but throws if missing so you can mutate safely. */
  writeComponent<C extends Component>(ctor: ComponentType<C>): C {
    const c = this.components.get(ctor);
    if (!c)
      throw new Error(`Entity ${this.id} is missing component ${ctor.name}`);
    return c as C;
  }

  removeComponent<C extends Component>(ctor: ComponentType<C>): void {
    this.components.delete(ctor);
  }

  has<C extends Component>(ctor: ComponentType<C>): boolean {
    return this.components.has(ctor);
  }
}
