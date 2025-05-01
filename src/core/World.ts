import { Entity } from "./Entity";
import { System } from "./System";

export class World {
  readonly entities: Entity[] = [];
  private readonly systems: System[] = [];

  createEntity(): Entity {
    const e = new Entity();
    this.entities.push(e);
    return e;
  }

  addSystem<S extends System>(system: S): this {
    system._attach(this);
    this.systems.push(system);
    return this;
  }

  /* ───── LIFECYCLE ──────────────────────────────────────────────── */

  async prepare(): Promise<void> {
    for (const s of this.systems) await s.prepare();
  }

  initialize(): void {
    for (const s of this.systems) s.initialize();
  }

  execute(delta: number): void {
    for (const s of this.systems) s.execute(delta);
  }

  finalize(): void {
    for (const s of this.systems) s.finalize();
  }
}
